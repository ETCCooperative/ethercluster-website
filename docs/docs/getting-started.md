# Getting Started

This guide will help you build your own Ethereum Classic API service using Ethercluster. This guide currently features Ethercluster deployment on Google Cloud Platform.

## Step 01 - Setup Google Cloud

- Signup for a [Google Cloud](https://cloud.google.com/) account and [create a new project](https://console.cloud.google.com/projectcreate). You can conveniently name your project, `ethercluster`.

<img width="540" alt="gcp_project" src="https://user-images.githubusercontent.com/10556209/96285459-9c85ce00-0fa4-11eb-9407-277b6ee700ca.png">

- Setup [billing](https://cloud.google.com/billing/docs/how-to/modify-project) if you're going to pursue making your Ethercluster. 

- Enable __Compute Engine API__, __Cloud Shell API__, and __Kubernetes Engine API__ which can be found in the [Marketplace](https://console.cloud.google.com/apis?_ga=2.172155431.56694028.1602866660-1600774775.1602866660). For example: 

<img width="497" alt="gcp_enable_api" src="https://user-images.githubusercontent.com/10556209/96285814-0e5e1780-0fa5-11eb-95ff-a3a3d571bf0a.png">

- [Setup Credentials](https://cloud.google.com/docs/authentication/getting-started) which will generate a JSON file for you to download. This will be used to easily authenticate into Google Cloud from your local terminal.

## Step 02 - Install Terraform

[Terraform](https://www.terraform.io/) is infra-as-code to allow you to provision your cloud infrastructure in a way that's clear and easy to roll-back and version control.

This allows any changes you make to your cloud architecture to be reflected in code and saved, so that any new changes you add can be tracked and debugged.

- [Download, unpack, and install Terraform](https://www.terraform.io/downloads.html) via release binary for your operating system https://www.terraform.io/downloads.html.

Downloading binary on Linux:

```shell
wget https://releases.hashicorp.com/terraform/0.13.4/terraform_0.13.4_linux_amd64.zip
```

Unpack files:

```shell
unzip terraform_0.13.4_linux_amd64.zip
```

At this point the executable `terraform` binary can be run. However, you may want to move it in a more appropriate location and add to your PATH.

```shell
sudo mv terraform /bin/
```

or move anywhere else and export to PATH

```shell
mv terraform /$HOME
```

```shell
export PATH="$PATH:/$HOME/terraform"
```

Run terraform from a terminal

```shell
terraform
```

## Step 03 - Create a Terraform configuration for GKE

Create directory for your Terraform project and change directory into it:

 ```shell
mkdir Ethercloud && cd Ethercloud
```

Initialize a new Terraform project:

```shell
terraform init
 ```

Terraform will return the following since there's no existing Terraform config files.

```
Terraform initialized in an empty directory!

The directory has no Terraform configuration files. You may begin working
with Terraform immediately by creating Terraform configuration files.
```

Now, create a new Terraform configuration file:

```shell
touch ethercloud.tf
```

Using your preferred editor, we'll have to specify our Ethercluster infrastructure in `ethercloud.tf` like so:

```
provider "google" {
    project = "ethercluster"
    region = "us-central1"       
    zone = "us-central1-c"
}

resource "google_container_cluster" "primary" {
    name = "ether-cluster"
    
    remove_default_node_pool = true
    initial_node_count = 1

    master_auth {
        username = ""
        password = ""
    }
}

resource "google_container_node_pool" "primary_preemptible_nodes" {
    name = "my-node-pool"
    cluster = "${google_container_cluster.primary.name}"
    node_count = 3
    
    node_config {
        preemptible = true
        machine_type = "n1-standard-1"

        metadata = {
            disable-legacy-endpoints = "true"
        }

        oauth_scopes = [
            "https://www.googleapis.com/auth/logging.write",
            "https://www.googleapis.com/auth/monitoring",
        ]
    }
}

output "client_certificate" {
    value = "${google_container_cluster.primary.master_auth.0.client_certificate}"
}

output "client_key" {
    value = "${google_container_cluster.primary.master_auth.0.client_key}"
}

output "cluster_ca_certificate" {
    value = "${google_container_cluster.primary.master_auth.0.cluster_ca_certificate}"
}

resource "google_compute_address" "ip_address" {
    name = "ethercluster-address"
}
```

## Understanding our Terraform configuration file

#### Provider

```tf
provider "google" {
    project = "ethercloud"
    region = "us-central1"
    zone = "us-central1-c"
}
```

What we did here was specify provider as `google`, gave it a project name `ethercloud`, and then added the region `us-central-1` and the zone `us-central1-c`. You don't have to use the same names and regions, but this will be what I use for the purpose of this guide.

### GKE

```
resource "google_container_cluster" "primary" {
    name = "ethercluster"

    remove_default_node_pool = true
    initial_node_count = 1

    master_auth {
        username = ""
        password = ""
    }
}
```

This specifies that we want a GKE cluster we will call `primary`. We also specify the cluster name as `ethercluster` We add an initial node count of `1`, but we can't specify our own Kubernetes node pool first, so we use the initial node count and then we delete it. We have our `master_auth` set to empty because we don't want to use any custom auth.

```
resource "google_container_node_pool" "primary_preemptible_nodes" {
    name = "my-node-pool"
    cluster = "${google_container_cluster.primary.name}"
    node_count = 3

    node_config {
        preemptible = true
        machine_type = "n1-standard-1"

        metadata = {
            disable-legacy-endpoints = "true"
        }

        oauth_scopes = [
            "https://www.googleapis.com/auth/logging.write",
            "https://www.googleapis.com/auth/monitoring",
        ]
    }
}
```

Here we are basically specifying the node pool with 3 nodes. Three nodes means three Google Compute Engine instances where we will be hosting out Kubernetes cluster. We also specify the type of instance to be `n1-standard-1`.

For more information on this setup, checkout the guide from Terraform [here](https://www.terraform.io/docs/providers/google/r/container_cluster.html).

Moving forward, we want to add the Cluster certificate and a static IP address in case you chose to expose your RPC endpoint publicly over SSL. It'll be easier to assign it to a static IP address you created on GKE so it doesn't change addresses every time you modify it.

```
output "client_certificate" {
    value = "${google_container_cluster.primary.master_auth.0.client_certificate}"
}

output "client_key" {
    value = "${google_container_cluster.primary.master_auth.0.client_key}"
}

output "cluster_ca_certificate" {
    value = "${google_container_cluster.primary.master_auth.0.cluster_ca_certificate}"
}

resource "google_compute_address" "ip_address" {
    name = "ethercluster-address"
}
```

Here, we basically specify the client key and certificate, as well as cluster certificate and ip_address. We will call this address `ethercluster-address`.

Great, we finally have the entire code we need to get started. Let's start terraforming!

## Step 04 - Terraform `Plan` and `Apply` infrastructure

Now that your infrastructure is defined in your terraform configuration file, it's time to `terraform plan` & `terraform apply`.

Terraform plan allows you to see what changes Terraform will do to your file without making the changes. It also is helpful for catching bugs.

Run `terraform plan`:

```shell
terraform plan
```

Terraform will analyse your code and return an output like the following:

```
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but will not be
persisted to local or remote state storage.


------------------------------------------------------------------------

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # google_compute_address.ip_address will be created
  + resource "google_compute_address" "ip_address" {
      + address_type       = "EXTERNAL"
      + name               = "ethercluster-address"
      *
    }

  # google_container_cluster.primary will be created
  + resource "google_container_cluster" "primary" {
      + name                        = "ether-cluster"
      + network                     = "default"
      *
    }

  # google_container_node_pool.primary_preemptible_nodes will be created
  + resource "google_container_node_pool" "primary_preemptible_nodes" {
      + cluster             = "ether-cluster"
      + id                  = (known after apply)
      *
      + management {
          * 
        }

      + node_config {
            *
        }
    }

Plan: 3 to add, 0 to change, 0 to destroy.

------------------------------------------------------------------------
```

Note, this isn't the exact output, it'll have a lot more data in it with keys, but the values will say `(known after apply)`. This tells us that Terraform won't have the exact values for the configuration of our cloud for most of the keys until after we actually create our architecture on Google Cloud.

To apply the configuration on Google Cloud, simply run `terraform apply`.

Run Terraform apply:

```shell
terraform apply
```


Now, since you already have your project json file from Google Cloud for authing added to your PATH in previous sections, Terraform can use it to deploy your cloud architecture for you. It'll go through the same output you saw in plan but with an execution plan and then start creating your instances. It'll take a little time to create, so go have a coffee break while you wait.

The output will look something like the following.

![terraform-apply](https://user-images.githubusercontent.com/10556209/96288555-36e81080-0fa9-11eb-8afb-0ff68611cd23.gif)

```
An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:
*
*
*
Apply complete! Resources: 3 added, 0 changed, 0 destroyed.
```

Terraform has just created your infrastructure architecture on Google Cloud. Now it's time to SSH into Google Cloud Shell.

## Step 05 - Final cluster setup

Now, at this point we have our Ethercluster node infrastructure deployed which is a fully functioning kubernetes cluster on Google Cloud. Running a node requires storage, the protocol providing client, and our desired networking for access the API.

### Namespace

Namespaces in Kubernetes allow us to assign a name for specific projects we are working on inside Kubernetes. It's useful if you want to organize your cluster between `dev` and `prod` namespaces for example.

Here, we will just be using it for `ethercluster` to make it easier to see everything.

To create a namespace, I'll be writing up a YAMl config file for Kubernetes.

Each Kubernetes manifest file has three things:

apiVersion (to specify which API to use)
kind (to determine what Kubernetes component the file is)
metadata (extra information about the manifest)

We also have a `spec` section to specify how we want the manifest behaves, which we will see when we build our cluster.

Picking up from where we left off in Google Cloud Shell page, let's see if `kubectl` is running. `kubectl` is a command line application that uses the Kubernetes API to interact with your cluster.

Connect to cluster from inside Google Cloud Shell:

```shell
gcloud container clusters get-credentials ethercloud --zone us-central1-c --project ethercloud
```

Check if `kubectl` is working:

```shell
kubectl
```

The output would be similar to:


```
The output should look something like this:

kubectl controls the Kubernetes cluster manager.

Find more information at: https://kubernetes.io/docs/reference/kubectl/overview/

*
*
*

Usage:
  kubectl [flags] [options]

Use "kubectl <command> --help" for more information about a given command.
Use "kubectl options" for a list of global command-line options (applies to all commands).
```

Now, let's define namespace in the Namespace manifect file. You can use `vim` or your preferred editor:

```shell
vim ethercluster-namespace.yml
```

Add the following:

```yaml
apiVersion: v1
kind: Namespace
metadata:
    name: ethercluster 
    labels:
        name: ethercluster 
```

This specifies that our manifest is `kind` of `Namespace`, with a name of `ethercluster`.

Now that there is a manifest for Namespace, it has to be applied like so:

```shell
kubectl apply -f ethercluster-namespace.yml
```

Output:

```
namespace/ethercluster created
```

### Volume

We will need to specify a [StorageClass](https://kubernetes.io/docs/concepts/storage/storage-classes/) for our Deployment volume. Here, we will use SSD since it's best for syncing clients.

```shell
vim classic-storage-class.yml
```

Add the following:

```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: classic-ssd
  namespace: ethercluster
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
  zones: us-central1-c
reclaimPolicy: Retain
```

Notice how we specified the provisioner to be `gce-pd`. It's to specify the Cloud Provider type of disk we want. We then specify it to be a persistent disk SSD `pd-ssd` and the zone is `us-central1-c` which is the same one we specified in Terraform, which is where our GKE cluster was created.

Let's create the StorageClass via:

```shell
kubectl apply -f classic-storage-class.yml
```

This will create the StorageClass in Google Cloud which we will use when doing a Deployment later.

### Service

In Service, we will need to specify the ports we are interested in obtaining from our node. For the purpose of a public RPC endpoint, we will need port 8545 which is the default RPC port. If you need something more custom, like WebSockets, then port 8546 is the one you want. Here, we will only go over 8545. We add 8080 for default and 443 for SSL.

```shell
vim classic-service.yml
```

Add the following:

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: classic
  name: classic
  namespace: ethercluster
  annotations:
    cloud.google.com/app-protocols: '{"my-https-port":"HTTPS","my-http-port":"HTTP"}'
spec:
  selector:
    app: classic
  ports:
  - name: default
    protocol: TCP
    port: 80
    targetPort: 80
  - name: rpc-endpoint
    port: 8545
    protocol: TCP
    targetPort: 8545
  - name: https
    port: 443
    protocol: TCP
    targetPort: 443
  type: LoadBalancer
  sessionAffinity: ClientIP
```

If you notice, we specify the `kind` to be Service here. We call the service `classic` which will allow it to auto-discover the deployment after with the same name.

Notice how we have `port` and `targetPort` specified. It tells the Service we want to this Service's port 8545 to route to the container's port 8545.

We specify the type to be `LoadBalancer` to expose it and allow for selecting between the different nodes we will create with Parity. We also add a sessionAffinity so that if you connect to a node assigned by the load balancer, the next time you connect to it, load balancer will reconnect you to the same node.


Create the service:

```shell
kubectl apply -f classic-service.yml
```

Now, get all components of your cluster:

```shell
kubectl get all -n ethercluster
```

Example output:

```
NAME                        TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)                                       AGE
service/classic             LoadBalancer   10.00.00.00   <pending>      8080:30003/TCP,8545:30002/TCP,443:30001/TCP   1m
```

The external-ip is `<pending>` because Kubernetes is creating an endpoint to expose which may take a few minutes. While this is running we can move onto deploying our blockchain API service.

### Deployment

For the rest of this exercise we'll be going over the code found in this [repository](https://github.com/ethereum-classic-cooperative/ethercluster) which contains example manifest files. Before running our deployment and running a node we need to figure out what arguments we need for our Docker container image.

We will use [Hypereledger Besu](https://hub.docker.com/r/hyperledger/besu/tags) has our protocol providing client. Hyperledger Besu is an enterprise Ethereum client that can be used for Ethereum, Ethereum Classic, and related test networks.

If you're familiar with Docker, running a Besu docker container could be done with the following:

```shell
docker run -p 8545:8545 -p 13001:30303 hyperledger/besu:latest --rpc-http-enabled --network=CLASSIC
```

If you go to `deployments/classic/classic-besu-stateful-set.yml`, you'll see that the file has the `kind` value of [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/). This is important since it specifies we want a stateful application that guarantees ordering and uniqueness across any rescheduling. Imagine we didn't use a statefulset here. If we deploy our container to Kubernetes, Besu begins syncing the chain from the beginning. Kubernetes can then choose to restart Pods at intervals to ensure updates. What happens in this situation is that the restart will also cause Besu to resync from the beginning, which isn't what we desire. It's why StatefulSet is the desired Deployment here.

```
apiVersion: apps/v1beta1
kind: StatefulSet
metadata:
  name: classic
  namespace: ethercluster
  labels:
    app: classic
```

This is the beginning of our StatefulSet deployment file. It specifies the correct namespace for Ethercluster, names our Deployment `classic` in order to be able to identify what network it is, and points the `kind` to StatefulSet.

This isn't the only contents of the file, we will go on and define the `specs`.

In the specs, you'll notice we have the `replicas` to be 3. This means we will be running 3 Parity nodes, which we will LoadBalance. In containers section, we specify the image `besu` from Besu's Dockerhub endpoint.

We pass in the values to that containers such as `chain=classic`. This specifies that we want the Ethereum Classic chain to be our default network to run. This is how Kubernetes can specify the arguments for the container like Docker does in the previous example.

We also specify we want the ports 8545 since we want to expose the RPC. We have some readinessProbe and livenessProbe in order to do health checks on the Probe. It happens by doing an HTTP GET request on port 8545 of the container on the endpoint `/api/health`, which checks if the Parity node is fully synced or not. If it's not synced up yet, it returns a 503, otherwise it will return a 200, thus passing the health check.

We also specify a `volumeClaimTemplates` for this Deployment of 50 GB, which is what will be needed to run a full ETC node. If you want to instead run an ETH node, you'll need to adjust the value appropriately (300 GB to stay on the safe side).

Now, we will instantiate the deployment:

```shell
kubectl apply -f deployments/classic/classic-besu-stateful-set.yml
```

See the deployment in action:

```shell
kubectl get all -n ethercluster
```

Example output:

```
NAME                                     READY   STATUS    RESTARTS   AGE
pod/classic-0                            2/2     Running   0          1m
pod/classic-1                            2/2     Running   0          1m
pod/classic-2                            2/2     Running   0          1m

NAME                        TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)                                       AGE
service/classic             LoadBalancer   10.00.00.00     109.01.01.01      8080:30003/TCP,8545:30002/TCP,443:30001/TCP   1m

NAME                       READY   AGE
statefulset.apps/classic   3/3     1m
```

Note that the age shown above might not be exact to what you get since it's still creating each Pod 1 by 1. Why do we have three pods? It's because we specified our replica to be 3 in our deployment file.

Each pod is created by the Statefulset, where it's mounted to a volume from `classic-ssd` that we instantiated before, and then each image of the containers are pulled and instantiated, and begin running, before the next pod is created.

Inspect a pod individually:

```shell
kubectl describe pod classic-0 -n ethercluster
```

View logs:

```shell
kubectl logs classic-0 besu -n ethercluster
```

Woohoo! Now you have a fully functioning Ethereum Classic node with built on a kubernetes cluster.

### Confirm node is running 

Use [cURL](https://curl.haxx.se/) to call [JSON-RPC API methods](https://besu.hyperledger.org/en/stable/Reference/API-Methods/)to confirm the node is running.

_replace `IP` with your `External IP`  from `kubectl get services classic -n ethercluster`_

`eth_chainId` returns the chain ID of the network:

```json
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' localhost:8545
```

`eth_syncing` returns the starting, current, and highest block.

```json
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' localhost:8545
```

After connecting to mainnet `eth_syncing` will return something similar to:

```json
{
  "jsonrpc" : "2.0",
  "id" : 1,
  "result" : {
    "startingBlock" : "0x0",
    "currentBlock" : "0x2d0",
    "highestBlock" : "0x66c0"
  }
}
```

## Scaling Pods

Depending on your network traffic you may need to scale you may need to scale your cluster up or down in Kubernetes with one command:

```shell
kubernetes scale statefulset classic -n ethercluster --replicas=4
```

This will increase replicas to 4 or decrease replicas to however many you desire.

See it being created:

```shell
kubernetes get all -n ethercluster
```

Example output:

```
NAME                                     READY   STATUS    RESTARTS   AGE
pod/classic-0                            2/2     Running   0          10m
pod/classic-1                            2/2     Running   0          10m
pod/classic-2                            2/2     Running   0          10m
pod/classic-3                            2/2     Running   0          1m

NAME                        TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)                                       AGE
service/classic             LoadBalancer   10.00.00.00     109.01.01.01      8080:30003/TCP,8545:30002/TCP,443:30001/TCP   10m

NAME                       READY   AGE
statefulset.apps/classic   3/3     10m
```

Notice you now have a `classic-3` pod being created and beginning to sync. You can do the same thing to scale it back to 3 by changing the previous command from 4 replicas to 3. Also, GKE does offer auto-scaling for you if needed, but that'll affect your billing if you don't monitor it consistently.

In the next section, we will go over securing your endpoint with SSL when using it publicly. It's not really needed if you want to use RPC only internally within your own infrastructure.

## SSL Configuration

To setup SSL configuration you need:

- a domain name
- SSL certificate for the domain name

`Ethercluster.com` uses Namecheap and Namecheap has a guide on registering an SSL for you which will provide an:

- SSL Key `.key`
- SSL Certificate `.crt`

**NOTE** Setting up SSL for your Ethercluster is optional, but useful to expose your RPC publicly.

### Secrets

Now that we have our `domain-com.key` and `domain-com.crt`, we can create a Kubernetes secret for them so we can securely store it.

If we have both files in a directory called `config`, then we can run the following command to instantiate them:

```shell
kubectl tls tls-classic --key ./config/domain-com.key --cert ./config/domain-com.crt --namespace ethercluster 
```

### Ingress

[Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) allows us to route to different services to the outside via HTTP and HTTPS, as well as allow us to terminate TCP/SSL.

We will need to create the ingress manifest file then instantiate it. After that, we need to configure the Health Checks in Google Cloud.

```shell
vim ingress.yml
```

And input the following contents in ingress.yml:

```yml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
    name: ingress-ethercluster
    namespace: ethercluster
    annotations:
        kubernetes.io/ingress.global-static-ip-name: ethercluster-address
        kubernetes.io/ingress.allow-http: "false"
        kubernetes.io/ingress.class: "gce"
spec:
    tls:
      - hosts:
        - www.domain.com
        secretName: tls-classic
    backend:
      serviceName: classic 
      servicePort: 8545
    rules:
    - host: www.domain.com
      http:
        paths:
        - path: /
          backend:
            serviceName: classic
            servicePort: 8545
```

This specifies that we're creating an ingress that points to `ethercluster-address` (the static IP created in Terraform). It also assigns the host to the domains.com we added and provides 

It also assigns the host to the domain.com we added and provides the secretName as `tls-classic` as we created before. It wires to the backend to the serviceName `classic` at port 8545.

Instantiate the ingress:

```shell
kubectl apply -f ingress.yml
```

Monitor progression:

```shell
kubectl describe ingress ingress-ethercluster -n ethercluster
```

While you monitor it, you need to head over to Google Cloud to set up the Health Checks. Reason is, it won't be exposed publicly if the health checks aren't passed on Google Cloud, and they're not yet sure how to check the health status of Parity.

We do that by going over to Google Cloud, and then to Kubernetes Engine section on the left, and then click on Services as shown below:

<img width="775" alt="ingress" src="https://user-images.githubusercontent.com/10556209/97757447-b954f200-1aca-11eb-9a22-393b4ab3dd71.png">

We click on the Ingress we created earlier here, and then try to determine the port number for your classic service. It's the port number assigned by Kubernetes. You can find it by running the following:

```shell
kubectl get service classic -n ethercluster
```

It'll return what we saw earlier:

```
NAME                        TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)                                       AGE
service/classic             LoadBalancer   10.00.00.00   <pending>      8080:30003/TCP,8545:30002/TCP,443:30001/TCP   1m
```

If you notice under `PORT(S)`, you'll see the port `8545:30002`. The 30002 is the one assigned by Kubernetes for the abstracted 8545. That's the port you'll need to look for under the Ingress section, as shown below: list-ingress

Click on the appropriate one, which will lead you to its page.

Scroll down until you find the health check section. It has a link under it that you must click as well.

Now, you're taken to the Health Check page.

It checks Parity's 8545 port at actual port 30002. But it does the health check on this endpoint `/` Parity health checks happen at `/api/health`.

Configure it accordingly as shown below, then save it.

<img width="478" alt="health_check" src="https://user-images.githubusercontent.com/10556209/97757625-1e104c80-1acb-11eb-9af3-926dd9554312.png">

Now, wait about 10-15 minutes for the health checks to pass. You should be able to now use your RPC endpoint over SSL.

If you have any issues, you can always use `kubectl describe` to debug your ingress.

I hope you enjoyed this guide and the cool tools given to us by the Cloud, Kubernetes and Terraform.
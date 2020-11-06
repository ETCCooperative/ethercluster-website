import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'Open Source Ethereum-based Cloud Architecture',
    // imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        Ethercluster is built using state-of-the-art cloud infrastructure tools. This allows tracking every changes in your public RPC through code for easy version-control.
      </>
    ),
  },
  {
    title: 'Node Scalability Built-In',
    // imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>
        Use the power of Kubernetes to instantly increase clusters when you need to expand your ethereum-based node bandwidth. Scale down when you don't need it. The choice is yours.
      </>
    ),
  },
  {
    title: 'Open-Source and Decentralized',
    // imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        By running your own ethercluster for your own organization's needs, you ensure you have Decentralized nodes because you're not connecting to an endpoint everyone is using. Because it's open source, you're always free to use it and customize it anyway you want.
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/doc1')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;

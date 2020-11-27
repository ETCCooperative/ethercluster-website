module.exports = {
  title: 'Ethercluster',
  tagline: 'Open Source Ethereum-based Cloud Architecture.',
  url: 'https://etccooperative.github.io/ethercluster-site',
  // baseUrl: '/ethercluster-website/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'etccooperative', // Usually your GitHub org/user name.
  projectName: 'ethercluster-website', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Ethercluster',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.a1078a11.png',
      },
      items: [
        {
          to: 'docs/doc1',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/etccooperative/ethercluster',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'docs/doc1',
            },
            {
              label: 'Core Concepts',
              to: 'docs/doc2/',
            },
            {
              label: 'Build an Ethercluster',
              to: 'docs/doc3/',
            }
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/hQs894U',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/ETCCooperative/ethercluster-website',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ETC Cooperative. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};

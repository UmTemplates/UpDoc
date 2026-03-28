---
title: "UpDoc"
template: splash
hero:
  tagline: Create Umbraco documents from external sources — PDFs, web pages, and markdown files — using configurable extraction workflows.
  actions:
    - text: Get Started
      link: /UpDoc/introduction/
      icon: right-arrow
    - text: View on GitHub
      link: https://github.com/UmTemplates/UpDoc
      variant: minimal
      icon: external
---

import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <Card title="Introduction" icon="open-book">
    What UpDoc is, what it does, and who it's for.
    [Read more](/UpDoc/introduction/)
  </Card>
  <Card title="Setting Up a Workflow" icon="setting">
    Configure a source, destination, transform rules, and mappings.
    [Read more](/UpDoc/setup/)
  </Card>
  <Card title="Creating Documents" icon="document">
    How editors use "Create from Source" to generate content.
    [Read more](/UpDoc/usage/)
  </Card>
  <Card title="User Journeys" icon="rocket">
    Step-by-step paths through the UpDoc interface.
    [Read more](/UpDoc/user-journeys/)
  </Card>
</CardGrid>

import {
  ChainId,
  KpiToken,
  Oracle,
  Template,
  TemplateSpecification,
} from '@carrot-kpi/sdk'
import { utils, Wallet } from 'ethers'
import { createRoot } from 'react-dom/client'
import { Component as Page } from '../page'
import baseSpec from '../base.json'
import { long as longCommitHash } from 'git-rev-sync'

describe('page', () => {
  let kpiToken: KpiToken

  beforeAll(() => {
    const templateSpecification = new TemplateSpecification(
      'foo-cid',
      baseSpec.name,
      baseSpec.description,
      baseSpec.tags,
      baseSpec.repository,
      longCommitHash()
    )

    const randomAddress = (): string => Wallet.createRandom().address

    const template = new Template(1, randomAddress(), 1, templateSpecification)

    const oracle = new Oracle(
      ChainId.GOERLI,
      randomAddress(),
      template,
      false,
      utils.defaultAbiCoder.encode(['string'], ['Test'])
    )

    kpiToken = new KpiToken(
      ChainId.GOERLI,
      randomAddress(),
      template,
      [oracle],
      {
        description: 'A test KPI token instance',
        ipfsHash: 'fake-ipfs-hash',
        tags: ['fake', 'test'],
        title: 'Test KPI token instance',
      },
      Math.floor(Date.now() / 1000) - 86_400,
      false,
      utils.defaultAbiCoder.encode(['string'], ['test'])
    )
  })

  it('renders without crashing', () => {
    const div = createRoot(document.createElement('div'))
    div.render(<Page t={() => {}} kpiToken={kpiToken} />)
    div.unmount()
  })
})

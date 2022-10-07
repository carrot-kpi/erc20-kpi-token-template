import { ReactElement, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeI8n, addBundleForTemplate } from '@carrot-kpi/react'
import {
  ChainId,
  KpiToken,
  Oracle,
  Template,
  TemplateSpecification,
} from '@carrot-kpi/sdk'
import { BigNumber, utils, Wallet } from 'ethers'
import i18n from 'i18next'
import baseSpec from '../src/base.json'
import { Component as CreationForm } from '../src/creation-form'
import { bundle as creationFormBundle } from '../src/creation-form/i18n'
import { Component as Page } from '../src/page'
import { bundle as pageBundle } from '../src/page/i18n'
import { TFunction, useTranslation } from 'react-i18next'

const randomAddress = (): string => Wallet.createRandom().address

initializeI8n(i18n, {})
addBundleForTemplate(i18n, 'creationForm', creationFormBundle)
addBundleForTemplate(i18n, 'page', pageBundle)

const templateSpecification = new TemplateSpecification(
  'fake-cid',
  baseSpec.name,
  baseSpec.description,
  baseSpec.tags,
  baseSpec.repository,
  'fake-commit-hash'
)

const template = new Template(1, randomAddress(), 1, templateSpecification)

const oracle = new Oracle(
  ChainId.GOERLI,
  randomAddress(),
  template,
  false,
  utils.defaultAbiCoder.encode(['string'], ['Test'])
)

const kpiToken = new KpiToken(
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

const App = (): ReactElement => {
  const { t } = useTranslation()

  const [creationFormT, setCreationFormT] = useState<TFunction | null>(null)
  const [pageT, setPageT] = useState<TFunction | null>(null)

  useEffect(() => {
    setCreationFormT(() => (key: any, options?: any) => {
      return t(key, { ...options, ns: 'creationForm' })
    })
    setPageT(() => (key: any, options?: any) => {
      return t(key, { ...options, ns: 'page' })
    })
  }, [t])

  const handleDone = useCallback((data: string, value: BigNumber) => {
    console.log(data, value.toString())
  }, [])

  if (!creationFormT || !pageT) return <>Loading...</>
  return (
    <>
      <h1>Creation form</h1>
      <CreationForm t={creationFormT} onDone={handleDone} />
      <br />
      <h1>Page</h1>
      <Page t={pageT} kpiToken={kpiToken} />
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />)

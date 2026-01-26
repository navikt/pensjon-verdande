import { ExternalLinkIcon, FloppydiskIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  Button,
  DatePicker,
  Detail,
  Heading,
  HGrid,
  Link,
  Select,
  Switch,
  Textarea,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { isFuture, isToday, parseISO, setHours } from 'date-fns'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import type { ActionFunctionArgs } from 'react-router'
import { Form, useFetcher, useLoaderData } from 'react-router'
import { apiGet } from '~/services/api.server'
import { requireAccessToken } from '~/services/auth.server'
import { oppdaterInfoBanner } from '~/vedlikehold/vedlikehold.server'
import type { Infobanner, InfobannerVariant, OppdaterInfoBannerResponse } from '~/vedlikehold/vedlikehold.types'

export const loader = async ({ request }: ActionFunctionArgs) => {
  return await apiGet<Infobanner>('/api/verdande/infobanner', request)
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const infoBanner = (await request.json()) as Infobanner
  return await oppdaterInfoBanner(infoBanner, accessToken)
}

export default function InfoBannerPage() {
  const infobanner = useLoaderData<typeof loader>()
  const fecher = useFetcher()
  const response = fecher.data as OppdaterInfoBannerResponse | undefined

  const [validToDate, setValidToDate] = useState<Date | undefined>(
    infobanner.validToDate !== null ? parseISO(infobanner.validToDate) : undefined,
  )

  const [beskrivelse, setBeskrivelse] = useState<string>(infobanner.description ?? '')
  const [valgtVariant, setValgtVariant] = useState<InfobannerVariant>(infobanner.variant ?? 'INFO')
  const [url, setUrl] = useState<string | undefined>(infobanner.url ?? undefined)
  const [urlText, setUrlText] = useState<string | undefined>(infobanner.urlText ?? undefined)

  const brukUrl = url !== undefined && urlText !== undefined

  const enabled = validToDate !== undefined && (isFuture(validToDate) || isToday(validToDate))

  return (
    <HGrid columns={{ xs: 1, md: 1, xl: 2 }} gap="space-5">
      <Form method="post">
        <VStack gap="space-5" style={{ width: '25em' }}>
          <Heading size="medium">Endre Infobanner</Heading>
          <BodyLong size="medium">Her kan infobanner i PSAK endres. </BodyLong>
          <Textarea
            label="Beskrivelse"
            value={beskrivelse}
            onChange={(event) => setBeskrivelse(event.target.value)}
            maxLength={1000}
            resize
          ></Textarea>
          <Select
            label="Variant"
            value={valgtVariant}
            onChange={(event) => setValgtVariant(event.target.value as InfobannerVariant)}
          >
            <option value="INFO">Informasjon</option>
            <option value="WARNING">Advarsel</option>
            <option value="ERROR">Alvorlig feil</option>
          </Select>

          <Switch checked={brukUrl} onChange={onActivateUrl}>
            Lenke i Banner
          </Switch>
          {brukUrl && (
            <>
              <TextField label="URL" value={url} onChange={(event) => setUrl(event.target.value)} />
              <TextField label="Lenketekst" value={urlText} onChange={(event) => setUrlText(event.target.value)} />
            </>
          )}

          <Switch checked={enabled} onChange={onActivateBanner}>
            Aktiver infobanner
          </Switch>
          {enabled && (
            <VStack gap="space-3">
              <Alert variant="info" inline>
                Til og med dato for når infobanner skal være aktivt
              </Alert>
              <DatePicker.Standalone
                fromDate={new Date()}
                selected={validToDate}
                onSelect={(date) => (date ? setValidToDate(setHours(date, 12)) : undefined)}
              ></DatePicker.Standalone>
            </VStack>
          )}
          {response?.erOppdatert && (
            <Alert variant="success" inline>
              Infobanner oppdatert!
            </Alert>
          )}

          <Button icon={<FloppydiskIcon />} loading={fecher.state === 'submitting'} onClick={(event) => submit(event)}>
            Lagre
          </Button>
        </VStack>
      </Form>
      <VStack gap="space-5">
        <Heading size="medium">Forhåndsvisning</Heading>
        {beskrivelse.length > 0 ? (
          <Alert variant={toAkselVariant(valgtVariant)} size="medium">
            <VStack gap="space-2">
              {beskrivelse}
              {urlText && url && (
                <Link href={url}>
                  {urlText}
                  <ExternalLinkIcon />
                </Link>
              )}
            </VStack>
          </Alert>
        ) : (
          <Detail>Ingenting å vise frem enda</Detail>
        )}
      </VStack>
    </HGrid>
  )

  function onActivateUrl(val: ChangeEvent<HTMLInputElement>) {
    if (val.target.checked) {
      setUrl(infobanner.url ?? '')
      setUrlText(infobanner.urlText ?? '')
    } else {
      setUrl(undefined)
      setUrlText(undefined)
    }
  }

  function onActivateBanner(val: ChangeEvent<HTMLInputElement>) {
    if (val.target.checked) {
      setValidToDate(setHours(new Date(), 12))
    } else {
      setValidToDate(undefined)
    }
  }

  function submit(event: React.MouseEvent) {
    event.preventDefault()
    fecher.submit(
      {
        validToDate: validToDate?.toISOString() ?? null,
        variant: valgtVariant ?? 'INFO',
        description: beskrivelse ?? '',
        url: url ?? null,
        urlText: urlText ?? null,
      },
      {
        method: 'POST',
        encType: 'application/json',
      },
    )
  }
}

function toAkselVariant(variant: InfobannerVariant): 'info' | 'warning' | 'error' {
  switch (variant) {
    case 'INFO':
      return 'info'
    case 'WARNING':
      return 'warning'
    case 'ERROR':
      return 'error'
  }
}

import { FormSummary, HGrid } from '@navikt/ds-react'

interface ReguleringsomregningOppsummeringProps {
  reguleringsdato: string
  prioritet: string
  fullstendigUttrekk: boolean
}

export function ReguleringsomregningOppsummering(props: ReguleringsomregningOppsummeringProps) {
  return (
    <div>
      <FormSummary>
        <FormSummary.Header> Du vil nå starte en behandling med følgende parametere</FormSummary.Header>

        <FormSummary.Answers>
          <FormSummary.Answer>
            <FormSummary.Label>Reguleringsdato</FormSummary.Label>
            <FormSummary.Value>{props.reguleringsdato && <>{props.reguleringsdato}</>}</FormSummary.Value>
          </FormSummary.Answer>

          <FormSummary.Answer>
            <FormSummary.Label>Omregning</FormSummary.Label>
            <HGrid columns={3} gap="space-40">
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>Prioritet - Iverksetting</FormSummary.Label>
                    <FormSummary.Value>{props.prioritet}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Fullstendig uttrekk</FormSummary.Label>
                    <FormSummary.Value>{props.fullstendigUttrekk ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>
            </HGrid>
          </FormSummary.Answer>
        </FormSummary.Answers>
      </FormSummary>
    </div>
  )
}

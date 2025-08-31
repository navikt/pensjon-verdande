import { FormSummary, HGrid } from '@navikt/ds-react'
import type { ComboboxOption } from 'node_modules/@navikt/ds-react/esm/form/combobox/types'
import React from 'react'

interface OmregningOppsummeringProps {
  behandlingsnokkel: string,
  omregningstidspunkt: string,

  kravGjelder: string,
  kravArsak: string,
  toleransegrenseSett: string,
  oppgaveSett: string,
  oppgavePrefiks: string,

  behandleApneKrav: boolean,
  brukFaktoromregning: boolean,
  opprettAlleOppgaver: boolean,
  sjekkYtelseFraAvtaleland: boolean,
  omregneAFP: boolean,
  skalIverksettOnline: boolean,
  skalSamordne: boolean,
  skalSletteIverksettingsoppgaver: boolean,
  skalDistribuereUforevedtak: boolean,
  skalBestilleBrev: string,

  selectedBrevkodeSokerAlderGammeltRegelverk: ComboboxOption | undefined,
  selectedBrevkodeSokerAlderNyttRegelverk: ComboboxOption | undefined,
  selectedBrevkodeSokerUforetrygd: ComboboxOption | undefined,
  selectedBrevkodeSokerBarnepensjon: ComboboxOption | undefined,
  selectedBrevkodeSokerAFP: ComboboxOption | undefined,
  selectedBrevkodeSokerGjenlevendepensjon: ComboboxOption | undefined,
  selectedBrevkodeSokerAFPPrivat: ComboboxOption | undefined,

  skalSendeBrevBerorteSaker: boolean,
  selectedBrevkoderBerorteSakerAlderGammeltRegelverk: ComboboxOption | undefined,
  selectedBrevkoderBerorteSakerAlderNyttRegelverk: ComboboxOption | undefined,
  selectedBrevkoderBerorteSakerUforetrygd: ComboboxOption | undefined,
  selectedBrevkoderBerorteSakerBarnepensjon: ComboboxOption | undefined,
  selectedBrevkoderBerorteSakerAFP: ComboboxOption | undefined,
  selectedBrevkoderBerorteSakerGjenlevendepensjon: ComboboxOption | undefined,
  selectedBrevkodeBerorteSakerAFPPrivat: ComboboxOption | undefined,


}

export default function OmregningOppsummering(props: OmregningOppsummeringProps) {
  return (
    <div>
      <FormSummary>
        <FormSummary.Header> Du vil nå starte en behandling med følgende parametere</FormSummary.Header>

        <FormSummary.Answers>
          <FormSummary.Answer>
            <FormSummary.Label>Behandlingsnøkkel</FormSummary.Label>
            <FormSummary.Value>{props.behandlingsnokkel && <>{props.behandlingsnokkel}</>}</FormSummary.Value>
          </FormSummary.Answer>

          <FormSummary.Answer>
            <FormSummary.Label>Omregningstidspunkt</FormSummary.Label>
            <FormSummary.Value>{props.omregningstidspunkt && <>{props.omregningstidspunkt}</>}</FormSummary.Value>
          </FormSummary.Answer>

          <FormSummary.Answer>
            <FormSummary.Label>Omregning</FormSummary.Label>
            <HGrid columns={3} gap='10'>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>Krav gjelder</FormSummary.Label>
                    <FormSummary.Value>{props.kravGjelder}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Kravårsak</FormSummary.Label>
                    <FormSummary.Value>{props.kravArsak}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Toleransegrense-sett</FormSummary.Label>
                    <FormSummary.Value>{props.toleransegrenseSett}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Oppgave-sett</FormSummary.Label>
                    <FormSummary.Value>{props.oppgaveSett}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Oppgave-prefiks</FormSummary.Label>
                    <FormSummary.Value>{props.oppgavePrefiks}</FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>

              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>Behandle åpne krav</FormSummary.Label>
                    <FormSummary.Value>{props.behandleApneKrav ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Bruk faktoromregning</FormSummary.Label>
                    <FormSummary.Value>{props.brukFaktoromregning ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Opprett alle oppgaver</FormSummary.Label>
                    <FormSummary.Value>{props.opprettAlleOppgaver ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Sjekk ytelser fra avtaleland</FormSummary.Label>
                    <FormSummary.Value>{props.sjekkYtelseFraAvtaleland ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Omregne AFP</FormSummary.Label>
                    <FormSummary.Value>{props.omregneAFP ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>

              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>Skal Iverksett Online</FormSummary.Label>
                    <FormSummary.Value>{props.skalIverksettOnline ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Skal samordne</FormSummary.Label>
                    <FormSummary.Value>{props.skalSamordne ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Skal slette iverksettingsoppgaver</FormSummary.Label>
                    <FormSummary.Value>{props.skalSletteIverksettingsoppgaver ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label>Skal distribuere uførevedtak</FormSummary.Label>
                    <FormSummary.Value>{props.skalDistribuereUforevedtak ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>
            </HGrid>
          </FormSummary.Answer>

          <FormSummary.Answer>
            <FormSummary.Label>Omregning brev</FormSummary.Label>
            <HGrid columns={2} gap='10'>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>Skal bestille brev for søker</FormSummary.Label>
                    <FormSummary.Value>{props.skalBestilleBrev}</FormSummary.Value>
                  </FormSummary.Answer>
                  {props.skalBestilleBrev != 'INGEN' && props.selectedBrevkodeSokerAlderGammeltRegelverk && props.selectedBrevkodeSokerAlderGammeltRegelverk.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Alder gammelt regelverk</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkodeSokerAlderGammeltRegelverk.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalBestilleBrev != 'INGEN' && props.selectedBrevkodeSokerAlderNyttRegelverk && props.selectedBrevkodeSokerAlderNyttRegelverk.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Alder nytt regelverk</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkodeSokerAlderNyttRegelverk.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalBestilleBrev != 'INGEN' && props.selectedBrevkodeSokerUforetrygd && props.selectedBrevkodeSokerUforetrygd.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Uføretrygd</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkodeSokerUforetrygd.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalBestilleBrev != 'INGEN' && props.selectedBrevkodeSokerBarnepensjon && props.selectedBrevkodeSokerBarnepensjon.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Barnepensjon</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkodeSokerBarnepensjon.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalBestilleBrev != 'INGEN' && props.selectedBrevkodeSokerAFP && props.selectedBrevkodeSokerAFP.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for AFP</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkodeSokerAFP.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalBestilleBrev != 'INGEN' && props.selectedBrevkodeSokerGjenlevendepensjon && props.selectedBrevkodeSokerGjenlevendepensjon.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Gjenlevendepensjon</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkodeSokerGjenlevendepensjon.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalBestilleBrev != 'INGEN' && props.selectedBrevkodeSokerAFPPrivat && props.selectedBrevkodeSokerAFPPrivat.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for AFP Privat</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkodeSokerAFPPrivat.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                </FormSummary.Answers>
              </FormSummary.Value>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>Skal sende brev for berørte saker</FormSummary.Label>
                    <FormSummary.Value>{props.skalSendeBrevBerorteSaker ? 'Ja' : 'Nei'}</FormSummary.Value>
                  </FormSummary.Answer>
                  {props.skalSendeBrevBerorteSaker && props.selectedBrevkoderBerorteSakerAlderGammeltRegelverk && props.selectedBrevkoderBerorteSakerAlderGammeltRegelverk.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Alder gammelt regelverk</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkoderBerorteSakerAlderGammeltRegelverk.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalSendeBrevBerorteSaker && props.selectedBrevkoderBerorteSakerAlderNyttRegelverk && props.selectedBrevkoderBerorteSakerAlderNyttRegelverk.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Alder nytt regelverk</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkoderBerorteSakerAlderNyttRegelverk.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalSendeBrevBerorteSaker && props.selectedBrevkoderBerorteSakerUforetrygd && props.selectedBrevkoderBerorteSakerUforetrygd.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Uføretrygd</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkoderBerorteSakerUforetrygd.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalSendeBrevBerorteSaker && props.selectedBrevkoderBerorteSakerBarnepensjon && props.selectedBrevkoderBerorteSakerBarnepensjon.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Barnepensjon</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkoderBerorteSakerBarnepensjon.value
                      }</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalSendeBrevBerorteSaker && props.selectedBrevkoderBerorteSakerAFP && props.selectedBrevkoderBerorteSakerAFP.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for AFP</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkoderBerorteSakerAFP.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalSendeBrevBerorteSaker && props.selectedBrevkoderBerorteSakerGjenlevendepensjon && props.selectedBrevkoderBerorteSakerGjenlevendepensjon.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for Gjenlevendepensjon</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkoderBerorteSakerGjenlevendepensjon.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                  {props.skalSendeBrevBerorteSaker && props.selectedBrevkodeBerorteSakerAFPPrivat && props.selectedBrevkodeBerorteSakerAFPPrivat.value !== 'not set' &&
                    <FormSummary.Answer>
                      <FormSummary.Label>Batchbrev for AFP Privat</FormSummary.Label>
                      <FormSummary.Value>{props.selectedBrevkodeBerorteSakerAFPPrivat.value}</FormSummary.Value>
                    </FormSummary.Answer>
                  }
                </FormSummary.Answers>
              </FormSummary.Value>
            </HGrid>
          </FormSummary.Answer>
        </FormSummary.Answers>
      </FormSummary>
    </div>
  );
}
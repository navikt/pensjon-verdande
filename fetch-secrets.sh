#!/usr/bin/env bash

# Alle filer som opprettes inneholder hemmeligheter — begrens til kun eier.
umask 077

env="q2"

bold=$(tput bold)
normal=$(tput sgr0)
white="[97;1m"
red="[31;1m"
endcolor="[0m"

envfile=".env"

command -v base64 >/dev/null 2>&1 || { echo -e >&2 "${red}Du må installere installere base64 (brew install base64 on macOS)${endcolor}"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e >&2 "${red}Du må installere jq (brew install jq on macOS)${endcolor}"; exit 1; }
command -v nais >/dev/null 2>&1 || { echo -e >&2 "${red}Du må installere nais CLI (https://docs.nais.io/operate/how-to/command-line-access/)${endcolor}"; exit 1; }
command -v gcloud >/dev/null 2>&1 || { echo -e >&2 "${red}Du må installere gcloud (https://docs.nais.io/operate/how-to/command-line-access/)${endcolor}"; exit 1; }

if command -v nais >& /dev/null; then
  DISCONNECT_STATUS=$(nais device status | grep -c Disconnected)

  if [ $DISCONNECT_STATUS -eq 1 ]; then
    read -p "Du er ikke koblet til med naisdevice. Vil du koble til? (J/n) " -n 1 -r -s
    echo
    if [[ $REPLY = "" || $REPLY =~ ^[YyjJ]$ ]]; then
      nais device connect
    else
      echo -e "${red}Du må være koblet til med naisdevice, avslutter${endcolor}"
      exit 1
    fi
  fi
fi

gcloud auth print-access-token >& /dev/null || (
  read -p "Inlogging i GCP er utløpt. Vil du autentisere på nytt? (J/n) " -n 1 -r -s
  echo
  if [[ $REPLY == "" || $REPLY =~ ^[YyjJ]$ ]]; then
    gcloud auth login --update-adc
  else
    echo -e "${red}Du må ha en gyldig innlogging i GCP. Du kan logge inn med 'gcloud auth login --update-adc', avslutter${endcolor}"
    exit 1
  fi
) || exit 1

function fetch_nais_secret_env {
    local type=$1
    local team=$2
    local environment=$3
    local app=$4
    local var_for_secret_lookup=$5
    local A=("$@")

    echo -n -e "\t- $type "

    local secret_name
    secret_name=$(nais app env "$app" -t "$team" -e "$environment" -o json 2>/dev/null \
      | jq -r --arg v "$var_for_secret_lookup" '[.[] | select(.name == $v and .source.kind == "SECRET")][0].source.name // empty')

    if [[ -z "$secret_name" ]]; then
        echo
        echo -e "${red}Fant ikke noen secret som inneholder \"$var_for_secret_lookup\" for app \"$app\" i \"$environment\".${endcolor}"
        exit 1
    fi

    local secret_response
    secret_response=$(nais secret get "$secret_name" -t "$team" --environment "$environment" --with-values \
      --reason "Henter secrets for lokal utvikling (fetch-secrets.sh)" --output json 2>&1)

    if [[ $? -ne 0 ]]; then
        echo
        echo -e "${red}Klarte ikke å hente secret \"$secret_name\":${endcolor}"
        echo "$secret_response"
        exit 1
    fi

    for name in "${A[@]:5}"
    do
        local value
        value=$(echo "$secret_response" | jq -r --arg k "$name" '.data[] | select(.key == $k) | .value')

        if [[ "$value" == "******" ]]; then
            echo
            echo -e "${red}Advarsel: \"$name\" er maskert av Nais og kan ikke hentes automatisk med 'nais secret get'.${endcolor}"
            echo -e "${red}Du må selv finne verdien (spør i #nais) og sette den manuelt i ${envfile}.${endcolor}"
            echo "$name=''" >> ${envfile}
            continue
        fi

        echo "$name='$value'" >> ${envfile}
    done

    echo -e "${bold}${white}✔${endcolor}${normal}"
}

rm -f ${envfile}
touch ${envfile}

echo

echo -e "${bold}Henter secrets via Nais CLI${normal}"

fetch_nais_secret_env "AzureAD" "pensjon-$env" "dev-gcp" "pensjon-verdande-$env" "AZURE_APP_CLIENT_ID" \
  "AZURE_APP_CLIENT_ID" \
  "AZURE_APP_CLIENT_SECRET" \
  "AZURE_APP_TENANT_ID" \
  "AZURE_OPENID_CONFIG_ISSUER" \
  "AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"

{
  echo ALDE_BEHANDLING_URL_TEMPLATE='http://localhost:3001/behandling/{behandlingId}'
  echo ALDE_LINK_ENABLED='true'
  echo AZURE_CALLBACK_URL=http://localhost:3000/auth/callback
  echo ENABLE_OAUTH20_CODE_FLOW=true
  echo ENV=q2
  echo LOKI_API_BASE_URL='https://loki.dev.nav.cloud.nais.io'
  echo PEN_APPLICATION=pensjon-pen-q2
  echo PEN_SCOPE=api://dev-fss.pensjon-q2.pensjon-pen-q2/.default
  echo PEN_SERVICE_NAME='pensjon-pen-q2'
  echo PEN_URL=http://localhost:8089
  echo PSAK_SAK_URL_TEMPLATE='http://localhost:9080/psak/sak/sakId={sakId}'
  echo TEMPO_DATA_SOURCE='dev-gcp-tempo'
} >> ${envfile}

echo

echo "${bold}Hentet hemmeligheter og oppdatert .env fil ${normal}"

#!/usr/bin/env bash

env="q2"

bold=$(tput bold)
normal=$(tput sgr0)
white="[97;1m"
red="[31;1m"
endcolor="[0m"

if [ "${BASH_VERSINFO:-0}" -lt 4 ]; then
    echo "Du har for gammel versjon av bash. Vennligst installer versjon 4 eller høyere"

    if [[ $OSTYPE == 'darwin'* ]]; then
        echo
        echo "På Mac kan du kjøre: ${white}brew install bash${endcolor}"
    fi

    exit 1
fi

command -v base64 >/dev/null 2>&1 || { echo -e >&2 "${red}Du må installere installere base64 (brew install base64 on macOS)${endcolor}"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e >&2 "${red}Du må installere kubectl (https://docs.nais.io/basics/access/)${endcolor}"; exit 1; }
command -v gcloud >/dev/null 2>&1 || { echo -e >&2 "${red}Du må installere gcloud (https://docs.nais.io/basics/access/)${endcolor}"; exit 1; }
command -v gcloud >/dev/null 2>&1 || { echo -e >&2 "${red}Du må installere gcloud (https://docs.nais.io/basics/access/)${endcolor}"; exit 1; }

if command -v nais >& /dev/null; then
  DISCONNECT_STATUS=$(nais device status | grep -c Disconnected)

  if [ $DISCONNECT_STATUS -eq 1 ]; then
    read -p "Du er ikke koblet til med naisdevice. Vil du koble til? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[YyjJ]$ ]]; then
      nais device connect
    else
      echo -e "${red}Du må være koblet til med naisdevice, avslutter${endcolor}"
      exit 1
    fi
  fi
fi

gcloud auth print-access-token >& /dev/null || (
  read -p "Inlogging i GCP er utløpt. Vil du autentisere på nytt? (j/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[YyjJ]$ ]]; then
    gcloud auth login
  else
    echo -e "${red}Du må ha en gyldig innlogging i GCP. Du kan logge inn med 'gcloud auth login', avslutter${endcolor}"
    exit 1
  fi
) || exit 1

declare -A kubernetes_context_namespace_secrets
declare -A kubernetes_secret_array

function fetch_kubernetes_secret {
    local context=$1
    local namespace=$2
    local secret=$3
    local name=$4
    local context_namespace_secrets_key
    local context_namespace_secrets_value
    local secret_name
    local secret_response

    echo -n -e "\t$name "


    context_namespace_secrets_key="$context:$namespace"

    if [ -v kubernetes_context_namespace_secrets["$context_namespace_secrets_key"] ]; then
        context_namespace_secrets_value=${kubernetes_context_namespace_secrets["$context_namespace_secrets_key"]}
    else
        context_namespace_secrets_value=$(kubectl --context="$context" -n "$namespace" get secrets)
        kubernetes_context_namespace_secrets["$context_namespace_secrets_key"]=$context_namespace_secrets_value
    fi

    secret_name=$(echo "$context_namespace_secrets_value" | grep "$secret" | tail -1 | awk '{print $1}')

    if [ -v kubernetes_secret_array["$secret_name"] ]; then
        secret_response=${kubernetes_secret_array["$secret_name"]}
    else
        secret_response=$(kubectl --context="$context" -n "$namespace" get secret "$secret_name" -o json)
        kubernetes_secret_array["$secret_name"]=$secret_response
    fi

    {
      echo -n "$name="
      echo "$secret_response" | jq -j ".data[\"$name\"]" | base64 --decode
      echo
    } >> .env

    echo -e "${bold}${white}✔${endcolor}${normal}"
}

function fetch_kubernetes_secret_array {
    local context=$1
    local namespace=$2
    local secret=$3
    local A=("$@")

    for i in "${A[@]:3}"
    do
        fetch_kubernetes_secret "$context" "$namespace" "$secret" "$i"
    done
}

rm -f .env
touch .env

echo

echo -e "${bold}Henter secrets fra Kubernetes${normal}"

fetch_kubernetes_secret_array "dev-gcp" "pensjon-$env" "azure-pensjon-bpc-$env" \
  "AZURE_APP_CLIENT_ID" \
  "AZURE_APP_CLIENT_SECRET" \
  "AZURE_APP_TENANT_ID" \
  "AZURE_OPENID_CONFIG_ISSUER" \
  "AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"

{
  echo AZURE_CALLBACK_URL=http://localhost:3000/auth/callback
  echo PEN_URL=http://localhost:8089
  echo PEN_SCOPE=api://dev-fss.pensjon-q2.pensjon-pen-q2/.default
  echo ENABLE_OAUTH20_CODE_FLOW=true
  echo ENV=q2
  echo PEN_APPLICATION=pensjon-pen-q2
} >> .env

echo

echo "${bold}Hentet hemmeligheter og oppdatert .env fil ${normal}"

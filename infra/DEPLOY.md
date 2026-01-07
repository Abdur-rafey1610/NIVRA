# Deploying Nivra infra (Bicep) - Quick Guide

Prerequisites
- Azure CLI logged in: `az login`
- `az` version supporting Bicep (or `bicep` CLI installed)
- `resourceGroup` created or create with `az group create -n nivra-rg -l eastus`

Steps
1. Edit `infra/main.bicep` parameters if needed (prefix, storage account name, SQL admin password placeholder).

2. Deploy the infra (provide a secure SQL admin password):

```powershell
$rg = 'nivra-rg'
$location = 'eastus'
az deployment group create --resource-group $rg --template-file infra/main.bicep --parameters location=$location prefix='nivra'
```

3. After deployment, get the Key Vault name and set secrets (replace placeholders):

```powershell
$vault = 'nivra-kv'
az keyvault secret set --vault-name $vault --name 'AML-Endpoint-URL' --value '<aml-endpoint-url>'
az keyvault secret set --vault-name $vault --name 'AML-Endpoint-Key' --value '<aml-key>'
az keyvault secret set --vault-name $vault --name 'SQL-Connection-String' --value '<sql-connection-string>'
```

4. Run DB schema script against Azure SQL (use `sqlcmd` or Azure Data Studio):

```powershell
# Example using sqlcmd
sqlcmd -S <sql_server_fqdn> -U sqladmin -P '<password>' -d master -i infra/db_schema.sql
```

5. Deploy backend to App Service (zip deploy) and configure app settings (KEYVAULT_URL, etc.).

6. Deploy Functions using `func azure functionapp publish <functionapp-name>` or CI/CD.

Notes
- Managed identities were enabled in the Bicep modules; Key Vault access policies were generated to allow App Service and Function App to `get` and `list` secrets.
- Ensure the SQL connection string is stored in Key Vault and provided to the backend via Key Vault or app settings.

Troubleshooting
- If App Service or Function App cannot read Key Vault secrets, confirm the principalId in Key Vault access policies matches the resource principal (you may need to re-run the Key Vault policy addition after identities are assigned).

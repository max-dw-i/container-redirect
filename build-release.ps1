param (
    [switch]$Sign
)


# Read '.env' file
Get-Content .env | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | Foreach-Object {
    $name, $value = $_.Split('=', 2)
    Set-Item "env:$($name.Trim())" $value.Trim()
}


# Build the extension file
rimraf $env:BUILD_DIR
rimraf $env:ARTIFACTS_DIR

Copy-Item -Force -Recurse ./static/icons ./src
npm run lint
npm run test
webpack --config ./webpack.prod
Copy-Item -Force -Recurse ./static/icons $env:BUILD_DIR
web-ext build -s $env:BUILD_DIR/

Compress-Archive -Path ./src,./package.json,./package-lock.json -DestinationPath $env:ARTIFACTS_DIR/source.zip

rimraf ./src/icons


# Sign the extension file
if ($Sign) {
    $credentials = & "$env:KEEPASS_CLI_EXE" show -a username -a password $env:KEEPASS_DB $env:KEEPASS_ENTITY
    if ($credentials.Count -lt 2) {
        Write-Error "Could not extract tokens for extension signing"
        exit 1
    }
    $issuer = $credentials[0].Trim()
    $secret = $credentials[1].Trim()

    web-ext sign --api-key=$issuer --api-secret=$secret --channel=unlisted --source-dir=$env:BUILD_DIR --artifacts-dir=$env:ARTIFACTS_DIR
}

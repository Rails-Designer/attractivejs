# Pin npm packages by running ./bin/importmap

pin "application"

pin "attractivejs" # @1.0.0
pin_all_from "app/javascript/actions", under: "actions"

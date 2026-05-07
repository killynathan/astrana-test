//go:build production

package main

import "embed"

//go:embed dist
var staticFiles embed.FS

const isProd = true

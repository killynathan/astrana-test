//go:build !production

package main

import "embed"

var staticFiles embed.FS

const isProd = false

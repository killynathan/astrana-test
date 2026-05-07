package main

import (
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"

	"astrana/db"
	"astrana/handlers"
)


func main() {
	db.Init("./astrana.db")

	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/adt-events", handlers.CreateADTEvent)

	mux.HandleFunc("GET /api/notifications", handlers.ListNotifications)
	mux.HandleFunc("POST /api/notifications/{id}/read", handlers.MarkNotificationRead)
	mux.HandleFunc("GET /api/analytics", handlers.GetAnalytics)

	if isProd {
		sub, err := fs.Sub(staticFiles, "dist")
		if err != nil {
			log.Fatalf("failed to load static files: %v", err)
		}
		fileServer := http.FileServerFS(sub)
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			f, err := sub.(fs.FS).Open(r.URL.Path[1:])
			if err == nil {
				f.Close()
				fileServer.ServeHTTP(w, r)
				return
			}
			index, _ := sub.(fs.FS).Open("index.html")
			defer index.Close()
			stat, _ := index.Stat()
			http.ServeContent(w, r, "index.html", stat.ModTime(), index.(io.ReadSeeker))
		})
	}

	var handler http.Handler = mux
	if !isProd {
		handler = corsMiddleware(mux)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("listening on :%s (production=%v)\n", port, isProd)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

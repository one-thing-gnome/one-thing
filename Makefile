.PHONY: clean install schemas

PREFIX ?= ${HOME}/.local

UUID   ?= one-thing@github.com
BUNDLE = ${UUID}.zip

ASSETS  = $(wildcard assets/*)
SCHEMAS = $(wildcard schemas/*/*.gschema.xml)
SOURCES = ${ASSETS} ${SCHEMAS} LICENSE entryMenu.js extension.js \
	  metadata.json prefs.js prefs/hotkey.js \
	  schemas/org.gnome.shell.extensions.one-thing.gschema.xml \
	  stylesheet.css widget.js

${BUNDLE}: ${SOURCES} schemas/gschemas.compiled
	zip -q "$@" $^

schemas/gschemas.compiled: ${SCHEMAS}
	glib-compile-schemas schemas/

clean:
	rm -f "${BUNDLE}"
	rm -f schemas/gschemas.compiled

install: ${BUNDLE}
	@touch "${PREFIX}/share/gnome-shell/extensions/${UUID}"
	rm -r "${PREFIX}/share/gnome-shell/extensions/${UUID}"
	unzip  -q "${BUNDLE}" -d "${PREFIX}/share/gnome-shell/extensions/${UUID}"

schemas: schemas/gschemas.compile

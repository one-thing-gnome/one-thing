.PHONY: clean install schemas bundle-dir

PREFIX ?= ${HOME}/.local

UUID      ?= one-thing@github.com
BUNDLE     = ${UUID}.zip
BUNDLE_DIR = bundle

ASSETS  = $(wildcard assets/*)
SCHEMAS = $(wildcard schemas/*/*.gschema.xml)
SOURCES = ${ASSETS} ${SCHEMAS} LICENSE entryMenu.js extension.js \
	  metadata.json prefs.js prefs/hotkey.js \
	  schemas/org.gnome.shell.extensions.one-thing.gschema.xml \
	  stylesheet.css widget.js

${BUNDLE}: schemas/gschemas.compiled bundle-dir
	cd ${BUNDLE_DIR} && zip -qr "../$@" .

bundle-dir: ${SOURCES}
	mkdir -p ${BUNDLE_DIR}/assets ${BUNDLE_DIR}/schemas ${BUNDLE_DIR}/prefs
	cp assets/* ${BUNDLE_DIR}/assets/
	cp schemas/*.xml ${BUNDLE_DIR}/schemas/
	cp prefs/hotkey.js ${BUNDLE_DIR}/prefs/
	cp LICENSE entryMenu.js extension.js metadata.json prefs.js stylesheet.css widget.js ${BUNDLE_DIR}/

schemas/gschemas.compiled: ${SCHEMAS}
	glib-compile-schemas schemas/

clean:
	rm -f "${BUNDLE}"
	rm -f schemas/gschemas.compiled
	rm -rf "${BUNDLE_DIR}"

install: ${BUNDLE}
	@touch "${PREFIX}/share/gnome-shell/extensions/${UUID}"
	rm -r "${PREFIX}/share/gnome-shell/extensions/${UUID}"
	unzip -q "${BUNDLE}" -d "${PREFIX}/share/gnome-shell/extensions/${UUID}"

schemas: schemas/gschemas.compiled

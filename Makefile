.PHONY: all clean remake

all: schemas/gschemas.compiled

schemas/gschemas.compiled: schemas/org.gnome.shell.extensions.one-thing.gschema.xml
		glib-compile-schemas schemas/

clean:
		rm -f schemas/gschemas.compiled

remake: clean all
# -*- Mode: makefile-gmake; tab-width: 4; indent-tabs-mode: t; fill-column: 100 -*-

source := \
    $(LOWAINSTDIR)favicon.ico \
    $(LOWAINSTDIR)soffice.data \
    $(LOWAINSTDIR)soffice.data.js.metadata \
    $(LOWAINSTDIR)soffice.js \
    $(LOWAINSTDIR)soffice.wasm \
    $(LOWAINSTDIR)soffice.worker.js \
    ../../source/zeta.js \
    convertpdf.js \
    index.html

define target
all: out/$(notdir $(1))
out/$(notdir $(1)): $(1)
	cp $$< $$@
endef

.PHONY: all
all: | out

.PHONY: clean
clean:
	rm -fr out

out:
	mkdir $@

$(foreach i,$(source),$(eval $(call target,$(i))))

# vim: set noet sw=4 ts=4:

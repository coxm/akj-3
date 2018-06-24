define mkdirp
mkdir -p "$(@D)"
endef


dist_dir=build/dist

png_sources_dir=assets/img
png_outputs_dir=$(dist_dir)/$(png_sources_dir)
png_sources=$(shell find "$(png_sources_dir)" -type f -path "*.png")
png_outputs=$(png_sources:$(png_sources_dir)/%.png=$(png_outputs_dir)/%.png)


.PHONY: dist
dist: pngs
	


.PHONY: pngs
pngs: $(png_outputs)
	


$(png_outputs_dir)/%.png: $(png_sources_dir)/%.png
	mkdir -p "$(@D)"
	# optipng --out "$@" "$+"
	cp "$+" "$@"

NPM_REGISTRY = ""
Name = $(n)
Type = $(t)

all: install

install:
	@npm install $(NPM_REGISTRY)
init:
	@./node_modules/.bin/gulp init --n=$(Name) --t=$(Type)
script:
	@./node_modules/.bin/gulp script --n=$(Name) --t=$(Type)
sass: sprite
	@./node_modules/.bin/gulp sass --n=$(Name) --t=$(Type)
less: sprite
	@./node_modules/.bin/gulp less --n=$(Name) --t=$(Type)
sprite:
	@./node_modules/.bin/gulp sprite --n=$(Name) --t=$(Type)
html:
	@./node_modules/.bin/gulp html --n=$(Name) --t=$(Type)
images:
	@./node_modules/.bin/gulp images --n=$(Name) --t=$(Type)
copy:
	@./node_modules/.bin/gulp copy --n=$(Name) --t=$(Type)
dev: html sass script images copy
	@./node_modules/.bin/gulp dev --n=$(Name) --t=$(Type)
clean:
	@./node_modules/.bin/gulp clean --n=$(Name) --t=$(Type)
concat:
	@./node_modules/.bin/gulp concat --n=$(Name) --t=$(Type)
release:
	@./node_modules/.bin/gulp release --n=$(Name) --t=$(Type)

.PYTHON: all
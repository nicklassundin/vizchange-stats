#WEBR_ROOT=/home/username/webr
#EMSCRIPTEN_ROOT=/home/username/emsdk/upstream/emscripten
Sys.setenv(EMSCRIPTEN_ROOT= "/home/username/workspace/vizchange/emsdk")
Sys.setenv(WEBR_ROOT="/home/username/workspace/vizchange/webr")

# TODO rscript parser of data
# install.packages("pak")
# install.packages("dplyr")
# install.packages("gitcreds")
# gitcreds_set()

# library(pak);
# install.packages("webr");
# library(webr)
# pak::pak("r-wasm/rwasm")
library(rwasm);
library(dplyr);

# build("r-package")
build("pak", dependencies = TRUE, ".")





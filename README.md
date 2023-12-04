# SEVA: Leveraging Sketches to Evaluate Alignment Between Human and Machine Visual Abstraction

This repository contains code and materials to reproduce the results in our NeurIPS 2023 Datasets and Benchmarks paper, **SEVA: Leveraging Sketches to Evaluate Alignment Between Human and Machine Visual Abstraction**.

[Paper](https://cogtoolslab.github.io/pdf/mukherjee_neurips_2023.pdf)📄\
[Project Page](https://seva-benchmark.github.io/)🌐\
[Reference Image pngs (from THINGS)](https://seva-benchmark.s3.us-west-2.amazonaws.com/things128_images.zip)🐱🚗🌯\
[Sketch pngs](https://seva-benchmark.s3.us-west-2.amazonaws.com/seva_production_pngs.zip)✏️\
[Sketch Metadata](https://seva-benchmark.s3.us-west-2.amazonaws.com/neurips_DB_human_clean.csv)💿\
[Recognition Experiment Data](https://www.dropbox.com/scl/fo/9yd0terq5axnwekab2gjv/h?rlkey=cq8zv5laiuw1rsyg2oxaz43lw&dl=0)📀


Below is an overview of the structure of this repository. Refer below for brief descriptions.

```bash
├── analysis
├── experiments
│   ├── category-selfpaced  
│   ├── recognition
├── results
│    ├── plots
├── data

```
`analysis` is a directory that contains analysis notebooks to replicate the results we report in our paper. The directory contains 3 files -
1. `analysis_nb.ipynb` is a jupyter notebook that contains code to reproduce the paper's main results with headers corresponding to sections in the paper.
2. `neurips_DB.Rmd` is an R markdown notebook that contains additional analyses, specifically the results of mixed-effects models.
3. `sketch_models.yml` specifies a conda environment with the appropriate packages to reproduce our code. We recommend using Minoconda to handle Python package dependeancies and also creating a new conda environment using the following command for the anaylsis notebook:
   
   ```
   conda env create -f sketch_models.yml
   ```
`experiments` is a directory that contains code to replicate the two human experiments we report in the paper. All the data required to replicate our analyses is already available via the AWS S3 links at the top of this README. We provide the code for reproducibility.
The directory contains 2 subdirectories -
`category-selfpaced` contains code and materials for the **human sketch production** experiment.
`recognition` contains code and maetrials for the **human sketch recognition** experiment.

`results` contains a subdirectory called `plots` which is where the jupyter notebooks will save plots that are generated.

`data` will be where intermediate output files from the analysis notebooks will be placed during execution.
These intermediate files serve as further input for the R markdown and jupyter notebooks.\
Additionally, please place the contents found inside [this folder](https://www.dropbox.com/scl/fo/9yd0terq5axnwekab2gjv/h?rlkey=cq8zv5laiuw1rsyg2oxaz43lw&dl=0) into the `data` directory before running any notebook cells.


# SEVA: Leveraging Sketches to Evaluate Alignment Between Human and Machine Visual Abstraction

This repository contains code and materials to reproduce the results in our NeurIPS 2023 Datasets and Benchmarks paper, **SEVA: Leveraging Sketches to Evaluate Alignment Between Human and Machine Visual Abstraction**.

(Paper)[https://cogtoolslab.github.io/pdf/mukherjee_neurips_2023.pdf]📄
(Project Page)[https://seva-benchmark.github.io/]🌐

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
`analysis` contains 3 files -
1. `analysis_nb.ipynb` is a jupyter notebook that contains code to reproduce the paper's main results with headers corresponding to sections in the paper.
2. `neurips_DB.Rmd` is an R markdown notebook that contains additional analyses, specifically the results of mixed-effects models.
3. `sketch_models.yml` specifies a conda environment with the appropriate packages to reproduce our code. We recommend creating a new conda environment using the following command:
   
   ```
   conda env create -f sketch_models.yml
   ```
`experiments` contains 2 subfolders -
`category-selfpaced` contains code and materials for the human sketch production experiment
`recognition` contains code and maetrials for the human sketch recognition experiment

`results` contains a subdirectory called `plots` which is where the jupyter notebooks will save plots that are generated.

`data` will need to contain intermediate outputs, which serve as input for the R markdown and jupyter notebooks. Please place the contents found inside the `recog_exp_data` folder <a href="https://www.dropbox.com/scl/fo/2oqncsagow0k7sbn52pd1/h?dl=0&rlkey=i7ezf9lezft7o0amawb24zlvd" target="_blank">here</a>
 inside the `data` directory running any notebook cells.



[sketch pngs](https://seva-benchmark.s3.us-west-2.amazonaws.com/seva_production_pngs.zip) \
[image pngs](https://seva-benchmark.s3.us-west-2.amazonaws.com/things128_images.zip) \
[sketch metadata](https://seva-benchmark.s3.us-west-2.amazonaws.com/neurips_DB_human_clean.csv)

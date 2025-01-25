[日本語 🇯🇵](./README_JP.md)

# About this app
GROWI provides a feature that bulk exports pages in PDF format, which can be executed from the page menu.
This app (PDF-Converter) is necessary to convert markdown pages to PDF during that process.

# Development
## Spec (only in Japanese)
[/資料/内部仕様/Page Bulk Export/PDF エクスポート](https://dev.growi.org/66ee8495830566b31e02c953)

## Developing inside a devcontainer
1. Open VSCode
1. Open command palette (Windows: Ctrl + Shift + P, Mac: Cmd + Shift + P)
1. Choose `Dev Containers: Open folder in Container...`
1. Choose the root growi directory you have cloned from https://github.com/weseek/growi
    - Not the PDF-Converter directory (growi/apps/pdf-converter)
1. Choose `GROWI-PDF-Converter` as the container to open
1. Execute `cd apps/pdf-converter && turbo dev:pdf-converter` to start the pdf-converter app
1. Edit files in apps/pdf-converter for development

## Requesting PDF-Converter from GROWI (both running in a devcontainer)
1. Open VSCode and open GROWI devcontainer
    - Choose `GROWI-Dev` for the container to open
1. Open a new VSCode window and open PDF-Converter devcontainer
    - Follow [Developing inside a devcontainer](#developing-inside-a-devcontainer)
1. Start both apps
1. Request PDF bulk export from the page menu in the GROWI app
    - It might take a few minutes, depending on GROWI's configurations

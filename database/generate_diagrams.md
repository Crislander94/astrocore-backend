# 📊 Generación de Diagramas ER

Este archivo contiene instrucciones para generar los diagramas entidad-relación en diferentes formatos.

## 🚀 Métodos de Visualización

### 1. **Visualización Online (Más Fácil)**

#### PlantUML Online Server
1. Ir a: [http://www.plantuml.com/plantuml/uml/](http://www.plantuml.com/plantuml/uml/)
2. Copiar el código PlantUML desde `entity_relationship_diagram.md`
3. Pegar en el editor online
4. Ver el diagrama renderizado instantáneamente
5. Descargar en PNG, SVG o PDF

#### PlantText (Alternativo)
1. Ir a: [https://www.planttext.com/](https://www.planttext.com/)
2. Pegar el código PlantUML
3. Generar y descargar

### 2. **Instalación Local**

#### Opción A: Node.js
```bash
# Instalar globalmente
npm install -g node-plantuml

# Generar diagrama
plantuml entity_relationship_diagram.md

# Generar en formato específico
plantuml -tpng entity_relationship_diagram.md
plantuml -tsvg entity_relationship_diagram.md
plantuml -tpdf entity_relationship_diagram.md
```

#### Opción B: Java (Oficial)
```bash
# Descargar PlantUML JAR
wget http://sourceforge.net/projects/plantuml/files/plantuml.jar/download -O plantuml.jar

# Generar diagrama
java -jar plantuml.jar entity_relationship_diagram.md

# Con formato específico
java -jar plantuml.jar -tpng entity_relationship_diagram.md
```

#### Opción C: Docker
```bash
# Usar imagen oficial
docker run --rm -v $(pwd):/data plantuml/plantuml:latest -tpng /data/entity_relationship_diagram.md
```

### 3. **Integración en IDEs**

#### VS Code
1. Instalar extensión: "PlantUML"
2. Abrir `entity_relationship_diagram.md`
3. Usar `Ctrl+Shift+P` → "PlantUML: Preview Current Diagram"
4. Exportar con `Ctrl+Shift+P` → "PlantUML: Export Current Diagram"

#### IntelliJ IDEA / WebStorm
1. Instalar plugin: "PlantUML Integration"
2. Abrir archivo con código PlantUML
3. Ver preview en panel lateral
4. Click derecho → "Export to PNG/SVG/PDF"

#### Vim/Neovim
```bash
# Instalar plugin
Plug 'aklt/plantuml-syntax'
Plug 'tyru/open-browser.vim'
Plug 'weirongxu/plantuml-previewer.vim'

# Usar :PlantumlOpen para preview
```

## 📁 Archivos de Salida Recomendados

```bash
# Estructura recomendada
database/
├── diagrams/
│   ├── er_complete.png          # Diagrama completo
│   ├── er_complete.svg          # Versión vectorial
│   ├── er_simple.png            # Diagrama simplificado
│   └── er_complete.pdf          # Para documentación
├── entity_relationship_diagram.md
└── generate_diagrams.md
```

## 🎨 Personalización de Diagramas

### Cambiar Colores
```plantuml
skinparam entity {
  BackgroundColor #E8F5E8    # Verde claro
  BorderColor #2E7D32        # Verde oscuro
}
```

### Cambiar Fuente
```plantuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
```

### Cambiar Orientación
```plantuml
!define DIRECTION top to bottom direction
# o
!define DIRECTION left to right direction
```

## 🔧 Troubleshooting

### Error: "Cannot find Java"
```bash
# Instalar Java (Ubuntu/Debian)
sudo apt install default-jre

# Verificar instalación
java -version
```

### Error: "Graphviz not found"
```bash
# Instalar Graphviz (Ubuntu/Debian)
sudo apt install graphviz

# macOS
brew install graphviz

# Windows
# Descargar desde: https://graphviz.org/download/
```

### Error: "Memory issues with large diagrams"
```bash
# Aumentar memoria Java
java -Xmx2048m -jar plantuml.jar diagram.md
```

## 📊 Formatos de Salida Disponibles

| Formato | Extensión | Uso Recomendado |
|---------|-----------|-----------------|
| PNG | `.png` | Documentación web, README |
| SVG | `.svg` | Escalable, web moderna |
| PDF | `.pdf` | Documentación formal |
| EPS | `.eps` | Publicaciones académicas |
| LaTeX | `.tex` | Documentos LaTeX |

## 🚀 Script Automatizado

Crear archivo `generate_all_diagrams.sh`:

```bash
#!/bin/bash

echo "🚀 Generando diagramas ER..."

# Crear directorio de salida
mkdir -p diagrams

# Generar diagrama completo
echo "📊 Generando diagrama completo..."
plantuml -tpng entity_relationship_diagram.md -o diagrams/
plantuml -tsvg entity_relationship_diagram.md -o diagrams/

# Renombrar archivos
mv diagrams/entity_relationship_diagram.png diagrams/er_complete.png
mv diagrams/entity_relationship_diagram.svg diagrams/er_complete.svg

echo "✅ Diagramas generados en ./diagrams/"
echo "📁 Archivos disponibles:"
ls -la diagrams/
```

Hacer ejecutable:
```bash
chmod +x generate_all_diagrams.sh
./generate_all_diagrams.sh
```

## 🌐 URLs Útiles

- **PlantUML Official**: [https://plantuml.com/](https://plantuml.com/)
- **Online Editor**: [http://www.plantuml.com/plantuml/uml/](http://www.plantuml.com/plantuml/uml/)
- **Language Reference**: [https://plantuml.com/guide](https://plantuml.com/guide)
- **ER Diagram Guide**: [https://plantuml.com/ie-diagram](https://plantuml.com/ie-diagram)
- **VS Code Extension**: [https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

---

**Creado:** 25/08/2025  
**Propósito:** Facilitar la generación de diagramas ER  
**Formatos soportados:** PNG, SVG, PDF, EPS

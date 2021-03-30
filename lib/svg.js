let seq = 0;

const components = {
  svg: ({width, height, children}) => {
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <pattern id="bg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="100" height="100" fill="#f8f8f8" />
      <line x1="0" y1="0" x2="100" y2="0" stroke="#d8d8d8" />
      <line x1="0" y1="20" x2="100" y2="20" stroke="#f0f0f0" />
      <line x1="0" y1="40" x2="100" y2="40" stroke="#f0f0f0" />
      <line x1="0" y1="60" x2="100" y2="60" stroke="#f0f0f0" />
      <line x1="0" y1="80" x2="100" y2="80" stroke="#f0f0f0" />
      <line x1="0" y1="0" x2="0" y2="100" stroke="#d8d8d8" />
      <line x1="20" y1="0" x2="20" y2="100" stroke="#f0f0f0" />
      <line x1="40" y1="0" x2="40" y2="100" stroke="#f0f0f0" />
      <line x1="60" y1="0" x2="60" y2="100" stroke="#f0f0f0" />
      <line x1="80" y1="0" x2="80" y2="100" stroke="#f0f0f0" />
    </pattern>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg)" />
  ${print(children)}
</svg>`;
  },

  entity: ({ x, y, rx, ry, width, height, name, fontSize, children }) => {
    const cp = `c${seq++}`;
    return `<rect x="${x}" y="${y}" rx="${rx}" ry="${ry}" width="${width}" height="${height}" fill="#fff" stroke="#333" />
<clipPath id="${cp}"><rect x="${x}" y="${y}" rx="${rx}" ry="${ry}" width="${width}" height="${height}" /></clipPath>
<text x="${x}" y="${y - 4}" font-size="${fontSize}" font-weight="bold" alignment-baseline="text-bottom" text-anchor="start">${name}</text>
<g x="${x}" y="${y}" font-size="${fontSize}" clip-path="url(#${cp})">
${print(children)}
</g>`;
  },

  field: ({ x, y, name, type, required, width, fontSize }) => {
    const mark = !required ? '' : `<rect x="${x + (fontSize / 2)}" y="${y - (fontSize / 2)}" width="3" height="4" stroke="#333" fill="none" />`;
    return `${mark}<text x="${x + 16}" y="${y}" alignment-baseline="text-top" text-anchor="start">${name}<tspan x="${x + width / 2}" dx="20" fill="#999">${type}</tspan></text>`;
  },

  relation: (props) => {
    // TODO
  },

  view: (props) => {
    // TODO
  },

  hr: ({ x, y, width }) => {
    return `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="#333" />`;
  },
};

/**
 * 描画用データに変換する
 * レイアウトの確定もここで行う
 * @param {*} data 
 * @returns context
 */
function build(data, options) {
  const nodes = [];
  let autoX = 20;
  let canvasWidth = 1024;
  let canvasHeight = 768;
  const autoPadding = 40;
  if ('entities' in data && data.entities.length > 0) {
    data.entities.forEach(entity => {
      const layout = entity.layout || {};
      let x = layout['x'] || 20;
      let y = layout['y'] || 20;
      let rx = 4;
      let ry = 4;
      let width = layout['width'] || 160;
      let height = layout['height'] || 20;
      let fontSize = 12;
      let children = [];
      if (!layout['x'] ) {
        x = autoX;
        autoX += width + autoPadding;
      }
      if ('attributes' in entity && entity.attributes.length > 0) {
        const pcnt = entity.attributes.filter(attr => attr.primary).length;
        children = entity.attributes
            .map((attr, i) => Object.assign({n: i + (attr['primary'] ? -100000 : 0)}, attr))
            .sort((a, b) => a.n - b.n) // primaryは先頭に移動する
            .map((attr, i) => ({
              component: 'field',
              x: x,
              y: y + ((i + 1) * 16) + (pcnt <= i ? 8 : 0),
              name: attr.name,
              type: attr.type,
              required: attr['required'] || false,
              fontSize,
              width,
            }));
        if (pcnt) {
          children.push({ component: 'hr', x, y: y + (pcnt * 16) + 8, width });
        }
        if (!layout['height']) {
          height = Math.max(entity.attributes.length * 16 + 16, height);
        }
      }
      nodes.push({ component: 'entity', name: entity.name, x, y, rx, ry, width, height, children, fontSize, });

      canvasWidth = Math.max(canvasWidth, x + width + autoPadding / 2);
      canvasHeight = Math.max(canvasHeight, y + height + autoPadding / 2);
    })
  }
  return {
    component: 'svg',
    width: canvasWidth,
    height: canvasHeight,
    children: nodes
  };
}

function trim(str) {
  return str.replace(/\n/g, ' ').replace(/ +/g, ' ').replace(/> </g, '><');
}

function print(array) {
  return (array && array.length > 0) ? array.map(data => trim(components[data.component](data))).join('') : '';
}

exports.render = (data, options) => components['svg'](build(data, options));
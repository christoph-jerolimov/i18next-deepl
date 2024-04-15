export const mustachToHtml = (input: string) => {
  let output = input;
  output = output.replace(/{{([a-zA-Z_]+?)}}/g, (_, variableName) => `<var name="${variableName}" />`);
  if (output.includes('{{') || output.includes('}}')) {
    console.log('**** Could not convert', input);
  }
  // console.log(input, "=>", output);
  return output;
};

export const htmlToMustach = (input: string) => {
  let output = input;
  output = output.replace(/<var name="([a-zA-Z_]+?)" \/>/g, (_, variableName) => `{{${variableName}}}`);
  // console.log(input, "=>", output);
  return output;
}

const utils = {
  mustachToHtml,
  htmlToMustach,
};

export default utils;

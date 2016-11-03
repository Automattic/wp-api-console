const schema = {
  type: 'object',
  additionalProperties: false,
  patternProperties: {
    // ApiName
    '.': {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

export default schema;

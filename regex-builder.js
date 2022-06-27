const kRegexRules = {
  isEmail: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  hasOnlyLetter: /^[a-zA-Z]+$/,
  specialCharacter: /[-[/\]{}()*+?.,\\^$|#\s]/
};

const kInstructions = {
  startsWith: (str) => {
    return "^" + str;
  }
}

function cleanUp(str) {
  return str.replace(/[-[/\]{}()*+?.,\\^$|#\s\\]/g, '\\$&');
}

function fromArrToString(input) {
  if (Array.isArray(input)) {
    input = input.map(x => cleanUp(x)).join('|');

    return `(${ input })`;
  }

  return input;
}

function decontaminateInput(input) {
  if (typeof input !== "string" && !Array.isArray(input)) {
    throw new Error("Must be a string or an array of string.")
  }

  if (Array.isArray(input)) {
    return fromArrToString(input);
  }

  else {
    return cleanUp(input);
  }
}

class RegexBuilder {
  instructions = [];
  preRegex = "";

  constructor() {}

  startsWith(input = "") {
    input = decontaminateInput(input)
    this.preRegex = `^${ input }${ this.preRegex }`;
    
    return this;
  }

  finishWith(input = "") {
    input = decontaminateInput(input)
    this.preRegex = `${ this.preRegex }${ input }$`;
    
    return this;
  }

  anything() {
    this.preRegex += '.*?';
    
    return this;
  }

  add(input) {
    this.preRegex += decontaminateInput(input);
    
    return this;
  }

  generateRegex(options = {}) {
    let flag = "s";

    if (options.recursive) {
      flag += "g"
    }

    if (options.multiline) {
      flag += "m"
    }

    return new RegExp(this.preRegex, flag);
  }

  until(input, untilEnd = false) {
    this.preRegex += `(?=${ decontaminateInput(input) }${ untilEnd ? "|$" : "" })`;
    
    return this;
  }

  static isEmail(input) {
    return kRegexRules.isEmail.test(input);
  }

  static hasOnlyLetter(input) {
    return kRegexRules.hasOnlyLetter.test(input);
  }

  static countOccurrence(str, target) {
    target = decontaminateInput(target);
    const regex = new RegExp(target, "g");
    const match = str.match(regex);

    return match ? match.length : 0;
  }
}

module.exports = {RegexBuilder};

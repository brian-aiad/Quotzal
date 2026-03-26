declare namespace google.maps.places {
  class Autocomplete {
    constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
    getPlace(): PlaceResult;
    addListener(event: string, handler: () => void): void;
  }
  interface AutocompleteOptions {
    types?: string[];
    componentRestrictions?: { country: string };
  }
  interface PlaceResult {
    formatted_address?: string;
  }
}

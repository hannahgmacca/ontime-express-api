export function formatCamelCase(string: string): string {
    return string
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

export function formatDecimalToString(value: number): string {
    return value != null || value != undefined ? value.toFixed(2) : '';
  }

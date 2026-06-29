export const rupee = (n) =>
'₹' + Number(n ?? 0).toLocaleString('en-IN');
export default function (...args) {
  let val = args[0];
  args.forEach(function (a) {
    if (val === null || val === undefined) val = a;
  });
  return val;
}

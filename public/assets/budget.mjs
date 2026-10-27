const MONTHLY_KEYS = new Set(["rent", "utilities", "internet", "food", "transport", "monthlyOther"]);
const ONE_OFF_KEYS = new Set(["travel", "insurance", "other"]);

function validCostMap(values, label) {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    throw new TypeError(`${label} must be an object of costs.`);
  }
  for (const [key, rawValue] of Object.entries(values)) {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${label}.${key} must be a finite, non-negative number.`);
    }
  }
}

function sumCosts(values) {
  return Object.values(values).reduce((sum, value) => sum + Number(value), 0);
}

export function calculateBudget({ months, travellers = 1, monthly = {}, oneOff = {}, contingencyPercent = 0 }) {
  const period = Number(months);
  const people = Number(travellers);
  const bufferRate = Number(contingencyPercent);

  if (!Number.isInteger(period) || period < 1 || period > 6) {
    throw new RangeError("Stay length must be a whole number from 1 to 6 months.");
  }
  if (people !== 1 && people !== 2) {
    throw new RangeError("Traveller count must be one or two.");
  }
  if (!Number.isFinite(bufferRate) || bufferRate < 0 || bufferRate > 50) {
    throw new RangeError("Contingency must be between 0 and 50 percent.");
  }
  validCostMap(monthly, "monthly");
  validCostMap(oneOff, "oneOff");

  const monthlyTotal = sumCosts(monthly);
  const oneOffTotal = sumCosts(oneOff);
  const baseTotal = monthlyTotal * period + oneOffTotal;
  const contingencyTotal = baseTotal * (bufferRate / 100);
  const total = baseTotal + contingencyTotal;

  return {
    months: period,
    travellers: people,
    monthlyTotal,
    oneOffTotal,
    contingencyPercent: bufferRate,
    contingencyTotal,
    baseTotal,
    total,
    averageMonthly: total / period,
    perTraveller: total / people,
  };
}

if (typeof document !== "undefined") {
  const form = document.querySelector("#budget-form");
  const result = document.querySelector("#budget-result");
  const error = document.querySelector("#budget-error");

  if (form && result && error) {
    const money = new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
    const readValue = (input) => input.value.trim() === "" ? 0 : Number(input.value);
    const write = (selector, amount) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = money.format(amount);
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      error.hidden = true;
      if (!form.reportValidity()) return;

      const monthly = {};
      const oneOff = {};
      for (const input of form.querySelectorAll("[data-cost-type][data-cost-key]")) {
        const key = input.dataset.costKey;
        const amount = readValue(input);
        if (input.dataset.costType === "monthly" && MONTHLY_KEYS.has(key)) monthly[key] = amount;
        if (input.dataset.costType === "one-off" && ONE_OFF_KEYS.has(key)) oneOff[key] = amount;
      }

      try {
        const totals = calculateBudget({
          months: Number(form.elements.months.value),
          travellers: Number(form.elements.travellers.value),
          monthly,
          oneOff,
          contingencyPercent: readValue(form.elements.contingency),
        });
        write("#monthly-result", totals.monthlyTotal);
        write("#oneoff-result", totals.oneOffTotal);
        write("#contingency-result", totals.contingencyTotal);
        write("#total-result", totals.total);
        write("#average-result", totals.averageMonthly);
        write("#per-traveller-result", totals.perTraveller);
        result.hidden = false;
      } catch (cause) {
        error.textContent = cause instanceof Error ? cause.message : "Tarkista syöttämäsi luvut.";
        error.hidden = false;
      }
    });

    form.addEventListener("reset", () => {
      result.hidden = true;
      error.hidden = true;
    });
  }
}

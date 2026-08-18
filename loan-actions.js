// loan-actions.js — Phase 8: immutable loan repayment actions.
// Kept as a normal script (not an ES module) so the PWA remains Safari/PWA compatible.
(function (global) {
  function cloneLoan(loan) {
    return { ...loan, movements: Array.isArray(loan.movements) ? [...loan.movements] : [] };
  }

  function addRepayment(loans, loanId, movement) {
    if (!Array.isArray(loans) || !movement) return loans;
    return loans.map(function (loan) {
      if (loan.id !== loanId) return loan;
      var next = cloneLoan(loan);
      var amount = Number(movement.amount || 0);
      next.repaid = Number(next.repaid || 0) + amount;
      next.movements = next.movements.concat([{ ...movement, kind: "repayment" }]);
      return next;
    });
  }

  function removeMovement(loans, loanId, movementId, kind, amount) {
    if (!Array.isArray(loans)) return loans;
    return loans.map(function (loan) {
      if (loan.id !== loanId) return loan;
      var next = cloneLoan(loan);
      var movementAmount = Number(amount || 0);
      if (kind === "repayment") {
        next.repaid = Math.max(0, Number(next.repaid || 0) - movementAmount);
      } else {
        next.amount = Math.max(0, Number(next.amount || 0) - movementAmount);
        next.repaid = Math.min(Number(next.repaid || 0), next.amount);
      }
      next.movements = next.movements.filter(function (m) {
        return m.id !== movementId;
      });
      return next;
    });
  }

  global.AleemFinLoanActions = Object.freeze({ addRepayment: addRepayment, removeMovement: removeMovement });
})(window);

// tabs/accounts.js — Accounts tab.
(function () {
  const h = React.createElement;

  function Accounts(props) {
    const { accounts, askDeleteAccount, darkMode, dateFmt, describeAccountMovement, getLastInflow, getLastOutflow, numFmt, openAddModal, openEditModal, selectionKey, settings, convertToBaseCurrency } = props;
    const baseCurrency = settings?.defaultCurrency || "AED";
    const accountColor = window.AleemFinShared.accountColor;
    const total = accounts.reduce((sum, a) => sum + convertToBaseCurrency(Number(a.balance || 0), a.currency), 0);

    return h("div", { className: "accounts-native space-y-4 max-w-2xl mx-auto w-full" },
      h("section", { className: `accounts-header-card ${darkMode ? "accounts-header-dark" : ""}` },
        h("div", { className: "accounts-header-top" },
          h("div", null,
            h("span", { className: "accounts-eyebrow" }, "YOUR MONEY"),
            h("h2", { className: "accounts-title" }, "Accounts"),
            h("p", { className: "accounts-subtitle" }, `${accounts.length} account${accounts.length === 1 ? "" : "s"} · ${accounts.length ? "All balances in your account currencies" : "Add an account to get started"}`)
          ),
          h("button", { onClick: () => openAddModal("account"), className: "accounts-add-button", "aria-label": "Add account" }, h(Icons.IconPlus, { className: "w-4 h-4" }), h("span", null, "Add"))
        ),
        accounts.length > 0 && h("div", { className: "accounts-total-row" },
          h("span", null, "Combined balance"),
          h("strong", null, baseCurrency, " ", numFmt(total))
        )
      ),
      h("div", { className: "accounts-list" }, accounts.map(acc => {
        const inflow = getLastInflow(acc.id);
        const outflow = getLastOutflow(acc.id);
        const inflowInfo = inflow ? describeAccountMovement(inflow, acc) : null;
        const outflowInfo = outflow ? describeAccountMovement(outflow, acc) : null;
        return h(window.SwipeRow, {
          key: acc.id,
          onEdit: () => openEditModal("account", acc),
          onDelete: () => askDeleteAccount(acc),
          selectionKey: selectionKey("account", acc.id)
        }, h("div", {
          className: `account-native-card ${darkMode ? "account-native-dark" : ""}`
        },
          h("div", { className: "account-card-head" },
            h("div", { className: "account-identity" },
              h("div", { className: "account-heading" },
                h("span", { className: "account-type" }, acc.type || "Bank Account"),
                h("div", { className: "account-title-row" },
                  h("span", { className: "account-color-dot", style: { backgroundColor: accountColor(acc), boxShadow: `0 0 0 3px ${accountColor(acc)}22` }, title: `${acc.name} color identity` }),
                  h("span", { className: "account-icon", "aria-hidden": "true" }, acc.type === "Bank" ? h(Icons.IconAccounts, { className: "w-4 h-4" }) : h(Icons.IconWallet, { className: "w-4 h-4" })),
                  h("h3", { className: "account-name" }, acc.name)
                )
              )
            ),
            h("div", { className: "account-balance-block" },
              h("span", { className: "account-currency" }, acc.currency),
              h("strong", { className: "account-balance" }, numFmt(acc.balance))
            )
          ),
          h("div", { className: "account-card-meta" },
            h("span", null, acc.currency),
            h("span", null, acc.type || "Account")
          ),
          (inflowInfo || outflowInfo) && h("div", { className: "account-flow-list" },
            inflowInfo && h("div", { className: "account-flow-row account-flow-income" },
              h(Icons.IconInflow, { className: "w-4 h-4 account-flow-in" }),
              h("div", { className: "min-w-0" }, h("span", null, "Last inflow"), h("small", null, `${dateFmt(inflow.date)}${inflowInfo.note || ""}`)),
              h("strong", null, "+", inflowInfo.cur, " ", numFmt(inflowInfo.amt))
            ),
            outflowInfo && h("div", { className: "account-flow-row account-flow-expense" },
              h(Icons.IconInflow, { className: "w-4 h-4 account-flow-out" }),
              h("div", { className: "min-w-0" }, h("span", null, "Last outflow"), h("small", null, `${dateFmt(outflow.date)}${outflowInfo.note || ""}`)),
              h("strong", null, "-", outflowInfo.cur, " ", numFmt(outflowInfo.amt))
            )
          )
        ));
      }))
    );
  }

  window.Tabs = window.Tabs || {};
  window.Tabs.Accounts = Accounts;
})();

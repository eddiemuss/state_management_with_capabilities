import { Actions, ActionReturnValue, ActionPolicy } from "./index";

// That could be behind a gem like pundit
// I think it would be possible to make that Type aggnostic but it will loose reability.
const policyByAction: (action: keyof Actions) => keyof ActionPolicy = (
  action
) => {
  return ({
    mark_as_treated: "can_mark_as_treated",
    mark_as_untreated: "can_mark_as_untreated",
    mark_as_to_finalize: "can_mark_as_to_finalize"
  } as const)[action];
};

const wrapPolicyAroundFunctionCall = (policy: () => boolean) => ({
  apply: (target: () => ActionReturnValue) => {
    if (policy()) {
      return target();
    }
    return { success: false, reason: "Not Authorized" };
  }
});

/**
 * This function will wrap each method incation of it's target class
 * with it's corresponding policy.
 * mark_as_treated with be wrapped with can_mark_as_treated.
 *
 * That should simulate the behaviour from pundit and a decorator pattern.
 * @param capability
 */
export const handleStateWithCapability = (capability: ActionPolicy) => ({
  get(target: Actions, action: keyof Actions) {
    return new Proxy(
      target[action],
      wrapPolicyAroundFunctionCall(capability[policyByAction(action)])
    );
  }
});

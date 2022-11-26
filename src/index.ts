import { handleStateWithCapability } from "./policy_helper";

type States = "untreated" | "treated" | "to_finalize";

type SuccessStatus = {
  success: true;
  new_state: States;
};

type FailStatus = {
  success: false;
  reason: string;
};

export type ActionReturnValue = SuccessStatus | FailStatus;

export interface Actions {
  mark_as_untreated(): ActionReturnValue;
  mark_as_treated(): ActionReturnValue;
  mark_as_to_finalize(): ActionReturnValue;
}

export interface ActionPolicy {
  can_mark_as_treated(): boolean;
  can_mark_as_untreated(): boolean;
  can_mark_as_to_finalize(): boolean;
}

/**
 * Defines which actions are general possible without thinking about
 * this users have access to particular state.
 */
class State implements Actions {
  mark_as_untreated(): ActionReturnValue {
    return { success: false, reason: "Not implemented" };
  }

  mark_as_treated(): ActionReturnValue {
    return { success: false, reason: "Not implemented" };
  }

  mark_as_to_finalize(): ActionReturnValue {
    return { success: false, reason: "Not implemented" };
  }
}

class Treated extends State {
  // Think about just adding one functionality like implementing
  // the action mark_as_untreated when the request is treated.
  // You just do it. No additional work is required. :)
  //
  // mark_as_untreated(): SuccessStatus {
  //   return { success: true, new_state: "untreated" };
  // }
}

class Untreated extends State {
  mark_as_treated(): SuccessStatus {
    return { success: true, new_state: "treated" };
  }

  mark_as_to_finalize(): SuccessStatus {
    return { success: true, new_state: "to_finalize" };
  }
}

class ToFinalize extends State {
  mark_as_treated(): SuccessStatus {
    return { success: true, new_state: "treated" };
  }

  mark_as_untreated(): SuccessStatus {
    return { success: true, new_state: "untreated" };
  }
}

/**
 * Defines which actions are allowed for this user without
 * knowing anything about what the action does.
 *
 * It only has to implement based on the actions the polices.
 * I got inspired by pundit :)
 */
class Capabilities implements ActionPolicy {
  can_mark_as_treated() {
    return false;
  }

  can_mark_as_untreated() {
    return false;
  }

  can_mark_as_to_finalize() {
    return false;
  }
}

class DoctorCapability extends Capabilities {
  can_mark_as_treated() {
    return true;
  }

  can_mark_as_untreated() {
    return true;
  }
}

class SecretaryCapability extends Capabilities {
  can_mark_as_treated() {
    return true;
  }

  can_mark_as_to_finalize() {
    return true;
  }
}

/**
 * This should be the Interface for the request model.
 * It's only job is the define based on the state input 'treated' | 'untreated'
 * the correct state object and combines it with the capability.
 * Which capability is not important for the class.
 */
abstract class ActionTransition implements Actions {
  abstract state: States;
  private capability: Capabilities = new Capabilities();

  mark_as_treated() {
    return this.get_allowed_state().mark_as_treated();
  }

  mark_as_untreated() {
    return this.get_allowed_state().mark_as_untreated();
  }

  mark_as_to_finalize() {
    return this.get_allowed_state().mark_as_to_finalize();
  }

  /**
   * This method should be used to authorized
   * any action with a correct capability.
   *
   * It should not be reimplemented or overwritten
   * @param capability
   */
  access_with(capability: Capabilities) {
    this.capability = capability;
    return this;
  }

  private get_allowed_state(): State {
    if (this.state === "treated") {
      return new Proxy(
        new Treated(),
        handleStateWithCapability(this.capability)
      );
    }
    if (this.state === "to_finalize") {
      return new Proxy(
        new ToFinalize(),
        handleStateWithCapability(this.capability)
      );
    }

    return new Proxy(
      new Untreated(),
      handleStateWithCapability(this.capability)
    );
  }
}

// Don't worry about that class normally this is handled by active record
class PatientRequestEntry extends ActionTransition {
  state: States = "untreated";

  constructor(loaded_state: States) {
    super();
    this.state = loaded_state;
  }

  set_state(state: States) {
    this.state = state;
    return this; // That makes method chaining possible.
  }
}

// First test!
// Load a treated request from DB (Thanks to active record):
const request = new PatientRequestEntry("treated");
// access mark as untreated from request object
console.log(
  "Treated request with no capability calls action mark_as_untreated",
  request.mark_as_untreated()
); // By default it will be not authorized

// create a doctor capability (Idearly we would get that from an access service)
const doctorCapability = new DoctorCapability();
// Let's perform mark as untreated with a doctor access
console.log(
  "calls action mark_as_untreated with doctor capability on an treated request",
  request.access_with(doctorCapability).mark_as_untreated()
); // You can see it's not implemented yet.
// Let us implemented!
// Go for that into the state for treated and add the functionality mark_as_untreated.

// After implementing the function call mark_as_untreated again. Look that we only needed to change one part.
// We just added new functionallity without huge effort. (Open/closed principal)
// console.log(request.access_with(doctorCapability).mark_as_untreated());

console.log("--- Looping over all possible combinations ---");

// Let us loop over all the different states, actions, and capabilities to see how they are behaving when calling.
const secretaryCapability = new SecretaryCapability();
const capabilities = [secretaryCapability, doctorCapability] as const;
const states = ["treated", "untreated", "to_finalize"] as const;
const actions = [
  "mark_as_treated",
  "mark_as_untreated",
  "mark_as_to_finalize"
] as const;

capabilities.forEach((capability) => {
  actions.forEach((action) => {
    states.forEach((state) => {
      console.log(
        `${capability.constructor.name} > ${action} - ${state}`,
        request.set_state(state).access_with(capability)[action]()
      );
    });
  });
});

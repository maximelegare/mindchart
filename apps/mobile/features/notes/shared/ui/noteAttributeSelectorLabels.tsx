import { fbs } from "fbtee";

export function PersonSelectorSheetTitle() {
  return <fbt desc="Person selector sheet title">Add People</fbt>;
}

export function personSelectorContactsDeniedMessage() {
  return fbs(
    "Contacts access was denied. Add people with +.",
    "Person selector message when contacts permission denied"
  );
}

export function personSelectorSearchPlaceholder() {
  return fbs("Search people", "Person selector search placeholder");
}

export function PersonSelectorSelectedHeading({ count }: { count: number }) {
  return (
    <fbt desc="Person selector selected count heading">
      Selected (<fbt:param name="count">{count}</fbt:param>)
    </fbt>
  );
}

export function personSelectorRemovePersonAccessibilityLabel(name: string) {
  return fbs(
    ["Remove ", fbs.param("personName", name)],
    "Accessibility label to remove selected person"
  );
}

export function personSelectorEmptyListMessage() {
  return fbs(
    "No people yet. Tap + to add someone.",
    "Person selector empty list message"
  );
}

export function personSelectorNoMorePeopleMessage() {
  return fbs(
    "No more people to add.",
    "Person selector message when all people are selected"
  );
}

export function PersonSelectorCloseLabel() {
  return <fbt desc="Person selector close button">Close</fbt>;
}

export function personSelectorAddPersonAccessibilityLabel() {
  return fbs("Add person", "Accessibility label for add person button");
}

export function PersonSelectorCreateContactTitle() {
  return (
    <fbt desc="Person selector create contact sheet title">Create Contact</fbt>
  );
}

export function personSelectorContactNamePlaceholder() {
  return fbs("Name", "Person selector contact name placeholder");
}

export function PersonSelectorAddContactLabel() {
  return <fbt desc="Person selector add contact button">Add</fbt>;
}

export function FeelingSelectorSheetTitle() {
  return <fbt desc="Feeling selector sheet title">How are you feeling?</fbt>;
}

export function LocationSelectorSheetTitle() {
  return <fbt desc="Location selector sheet title">Location</fbt>;
}

export function locationSelectorSearchPlaceholder() {
  return fbs(
    "Search or add a location",
    "Location selector search placeholder"
  );
}

export function LocationSelectorAddRowLabel({ name }: { name: string }) {
  return (
    <fbt desc="Location selector add new location row">
      Add “<fbt:param name="name">{name}</fbt:param>”
    </fbt>
  );
}

export function locationSelectorRemoveLocationAccessibilityLabel(name: string) {
  return fbs(
    ["Remove ", fbs.param("locationName", name)],
    "Accessibility label to remove a location"
  );
}

export function locationSelectorEmptyListMessage() {
  return fbs(
    "No locations yet. Type a name to add one.",
    "Location selector empty list message"
  );
}

export function locationSelectorNoMatchesMessage() {
  return fbs(
    "No matching locations.",
    "Location selector no search matches message"
  );
}

export function locationDeleteConfirmationDescription(name: string) {
  return fbs(
    [
      'Remove "',
      fbs.param("locationName", name),
      '" from all notes that use it?',
    ],
    "Location delete confirmation modal description"
  );
}

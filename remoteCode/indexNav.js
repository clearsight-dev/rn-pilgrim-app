// This file is generated. Do not edit.
import testnav from "./navigators/testnav/source/navigator";
import stackwithheader from "./navigators/stackwithheader/source/navigator";
import {registerCreator} from 'apptile-core';
export const navs = [
  {creator: stackwithheader, name: "stackwithheader"},
  {creator: testnav, name: "testnav"},
];

export function initNavs() {
  for (let nav of navs) {
    registerCreator(nav.name, nav.creator);
  }
}
  
export type Entity = {
  id: string;
  displayName: string;
};

export type CourseType = {
  id: string;
  displayName: string;
  subject: string;
};

export enum EntityCategory {
  TEACHER = "teacher",
  GROUP = "group",
  LOCATION = "location",
}

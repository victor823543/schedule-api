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

export type CalendarEventType = {
  id: string;
  displayName: string;
  belongsTo: Entity;
  type?: "LUNCH";
  course?: CourseType;
  teachers: Entity[];
  groups: Entity[];
  inLocations: Entity[];
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  cancelled?: boolean;
};

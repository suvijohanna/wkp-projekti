type Courses = {
  courses: Course[];
};

type Course = {
  name: string;
  price: string;
  diets: string;
};

type WeeklyMenu = {
  days: {
    date: string;
    courses: Course[];
  }[];
};

export { Courses, Course, WeeklyMenu };

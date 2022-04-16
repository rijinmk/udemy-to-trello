const fs = require('fs');
const cheerio = require('cheerio');
const { text } = require('cheerio/lib/static');

const paths = process.argv.slice(2);
const coursesOuter = '.panel--panel-toggler--30J_B';
const sectionsLecturesAndTime = '.curriculum--content-length--1XzLS';
const subSections = '.panel--content--2q9WW > ul > li';
let courseName = '.udlite-heading-xl.clp-lead__title.clp-lead__title--small';

// Reading paths
paths.forEach((path) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const $ = cheerio.load(data);
      let sections_raw = $(coursesOuter).text().split('\n');
      let sections = [];

      console.log(sections_raw);
      // Adjust spacing and line breaks
      for (let i = 0; i < sections_raw.length; i++) {
        if (sections_raw[i].trim().length > 0) {
          if (sections_raw[i].endsWith('min')) {
            sections.push(sections_raw[i]);
          } else {
            sections.push(sections_raw[i] + sections_raw[i + 1]);
            i++;
          }
        }
      }
      // Final sections
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].includes('  ')) {
          sections[i] = sections[i].replace(/\s{2,}/g, '');
        }
      }
      // [FOR TRELLO] Section text
      let section_refined = '';
      for (let i = 1; i < sections.length; i += 2) {
        let section_title = sections[i].split(' • ')[0];
        let section_time = sections[i].split(' • ')[1];
        let section_n = sections[i].match(/[\d]+ lecture/gi);
        section_title = section_title.replace(/[\d]+ lectures?/gi, ' ');
        section_refined += `[SECTION ${parseInt(
          i / 2 + 1
        )}] [${section_time}] [${section_n}] ${section_title}\n`;
      }

      const SECTIONS_FINAL_TEXT = section_refined;
      console.log(SECTIONS_FINAL_TEXT);

      // Information / Lesson Plan
      // This was added for modular control over the time calculation
      // Some sections are not needed (like legacy lessons)
      let total_time = 0;
      section_refined.split('\n').forEach((section, i) => {
        // Add argument/if statement for checking how many sections they want to calculate for
        let hours = /\[(\d+hr?)\]/gi.exec(section);
        let minutes = /\[(\d+min?)\]/gi.exec(section);
        let hours_minutes = /\[(\d+hr? \d+min?)\]/gi.exec(section);
        if (hours) {
          total_time += parseInt(hours[1].replace('hr', '')) * 60;
        }
        if (minutes) {
          total_time += parseInt(minutes[1].replace('min', ''));
        }
        if (hours_minutes) {
          let hours = hours_minutes[0]
            .split(' ')[0]
            .replace('hr', '')
            .replace('[', '');
          let minutes = hours_minutes[0].split(' ')[1].replace('min]', '');
          total_time += parseInt(hours) * 60 + parseInt(minutes);
        }
      });

      total_time = total_time / 60;

      // Getting total lectures
      let sections_lecture_time = $(sectionsLecturesAndTime).text();
      sections_lecture_time = sections_lecture_time
        .replace(/\s{2,}/gi, '')
        .split(/ •/);
      let total_sections = parseInt(
        sections_lecture_time[0].replace('sections', '')
      );
      let total_lectures = parseInt(
        sections_lecture_time[1].replace('lectures', '')
      );
      console.log(
        `[TOTAL] [${total_time}] [${total_sections}] [${total_lectures}]`
      );

      // 10 minutes more per lecture
      // NEXT TASK: Add 10 mins per video
      total_time = total_lectures * 10;
      total_time = total_time / 60;
      let two_hours_a_day = Math.floor(total_time / 2);
      let one_hour_a_day = Math.floor(total_time / 1);
      let three_hours_a_day = Math.floor(total_time / 3);
      let four_hours_a_day = Math.floor(total_time / 4);
      let five_hours_a_day = Math.floor(total_time / 5);
      let six_hours_a_day = Math.floor(total_time / 6);
      let seven_hours_a_day = Math.floor(total_time / 7);

      // GET LESSONS IN EACH SECTION
      let sections_lessons_raw = $(subSections).text();
      sections_lessons_raw = sections_lessons_raw.replace(/\s{2,}/gi, '');
      sections_lessons_raw = sections_lessons_raw.replace(
        /(\d{2,}:\d{2,})/gi,
        ' $1\n'
      );
      sections_lessons_raw = sections_lessons_raw.split('\n');
      let segmenting_sections = SECTIONS_FINAL_TEXT.split('\n').map((e) =>
        e.match(/\[(\d+) lecture\]/gi)
      );
      segmenting_sections = segmenting_sections.filter((e) => e !== null);
      let _segmenting_sections = [];
      segmenting_sections.forEach((e) => {
        _segmenting_sections.push(e[0]);
      });
      segmenting_sections = _segmenting_sections;
      segmenting_sections = segmenting_sections.map((e) => e.replace('[', ''));
      segmenting_sections = segmenting_sections.map((e) =>
        e.replace('lecture]', '')
      );
      segmenting_sections = segmenting_sections.map((e) => parseInt(e));
      let segmented_lecture = [];
      for (let i = 0; i < segmenting_sections.length; i++) {
        segmented_lecture.push(
          sections_lessons_raw.splice(0, segmenting_sections[i])
        );
      }

      let final_text = '';
      let each_section = section_refined.split('\n').filter((e) => !!e);
      final_text += `
⏱  Lesson plan to finish ${total_lectures} videos: 
------------------------------------
One hour a day, ${one_hour_a_day} days
Two hours a day, ${two_hours_a_day} days
Three hours a day, ${three_hours_a_day} days
Four hours a day, ${four_hours_a_day} days
Five hours a day, ${five_hours_a_day} days
Six hours a day, ${six_hours_a_day} days
Seven hours a day, ${seven_hours_a_day} days\n\n`;

      final_text += '\n📋  Each section:\n';
      final_text += '------------------------------------\n';
      each_section.forEach((e, i) => {
        final_text += e + '\n';
      });

      final_text += '\n📋  Lessons in each section:\n';
      final_text += '------------------------------------\n';
      each_section.forEach((e, i) => {
        final_text +=
          '🔸 ' + e + '\n' + segmented_lecture[i].join('\n') + '\n\n';
      });
      // write final text to a file
      courseName = $(courseName)
        .text()
        .replace(/\s{2,}/gi, '');
      fs.writeFile(`./${courseName}_lesson_plan.txt`, final_text, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
    }
  });
});

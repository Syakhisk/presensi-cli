require("dotenv").config()
const nfzf = require( 'node-fzf' )
const {bgCyan, red, cyan} = require('chalk')

const {access, readFile} = require('fs/promises')
const inquirer = require('inquirer');

const opts = {
  // list: [ 'whale', 'giraffe', 'monkey' ],
  prefill: '',
  prelinehook: function ( index ) { return '' },
  postlinehook: function ( index ) { return '' }
};


(async function () {
  const isClassesExists = await access("./user-classes.json").then(data => true).catch(() => false)
  if(!isClassesExists) return false

  const userClasses = JSON.parse(await readFile("./user-classes.json", {encoding: "utf-8"}))


//   console.log("------------")
//   console.log(bgCyan.black(" Presensi CLI "))
//   console.log("------------")
//   console.log()
// 
//   console.log(cyan("Choose a class: "))
// 
//   opts.list = userClasses.map(item => item.name)
//   const result = await nfzf(opts)
//   const { selected, query } = result
// 
//   if( !selected ) {
//     console.log( 'No matches for:', query )
//   } else {
//     console.log( selected.value ) // 'giraffe'
//     console.log( selected.index ) // 1
//     console.log( selected.value === opts.list[ selected.index ] ) // true
//   }

 inquirer
  .prompt([
    {
      type: 'rawlist',
      name: 'theme',
      message: 'What do you want to do?',
      pageSize: userClasses.length + 1,
      choices: userClasses.map(item => item.name)
    },
  ])
  .then((answers) => {
  console.log(answers)
  })
  .catch((error) => {
    if (error.isTtyError) {
      console.log("tty")
    } else {
    console.log(error)
    }
  });
})()

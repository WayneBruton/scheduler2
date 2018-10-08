$(function() {
    // Bar chart
        new Chart(document.getElementById("bar-chart"), {
            type: 'bar',
            data: {
            labels: ["AIB", "CCP", "Package", "Single"],
            datasets: [
                {
                label: "Wages August 2018",
                backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#c45850"],
                data: [269040,209003,85200,580806]
                }
            ]
            },
            options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Wages by client type for August 2018'
            }
            }
        });

        new Chart(document.getElementById("bar-chart-grouped"), {
            type: 'bar',
            data: {
              labels: ["AIB", "CCP", "Package", "Single"],
              datasets: [
                {
                  label: "Wages",
                  backgroundColor: "#3e95cd",
                  data: [269040,209003,85200,580806]
                }, {
                  label: "Income",
                  backgroundColor: "#8e5ea2",
                  data: [309306,240353,91164, 868017]
                }
              ]
            },
            options: {
              title: {
                display: true,
                text: 'GP per Client Type'
              }
            }
        });

        new Chart(document.getElementById("doughnut-chart"), {
            type: 'doughnut',
            data: {
              labels: ["AIB", "CCP", "Package", "Single"],
              datasets: [
                {
                  label: "Clients by Type",
                  backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#c45850"],
                  data: [22,21,11,51]
                }
              ]
            },
            options: {
              title: {
                display: true,
                text: 'Clients by Type in August 2018'
              }
            }
        });

        new Chart(document.getElementById("polar-chart"), {
            type: 'polarArea',
            data: {
              labels: ["AIB", "CCP", "Package", "Single"],
              datasets: [
                {
                  label: "Hours Billed",
                  backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#c45850"],
                  data: [9684, 7631.75,3228, 21132.25]
                }
              ]
            },
            options: {
              title: {
                display: true,
                text: 'Hours billed in August 2018'
              }
            }
        });

//         new Chart(document.getElementById("pie-chart"), {
//     type: 'pie',
//     data: {
//       labels: ["Africa", "Asia", "Europe", "Latin America", "North America"],
//       datasets: [{
//         label: "Population (millions)",
//         backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
//         data: [2478,5267,734,784,433]
//       }]
//     },
//     options: {
//       title: {
//         display: true,
//         text: 'Predicted world population (millions) in 2050'
//       }
//     }
// });

});


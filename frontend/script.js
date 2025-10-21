const socket = io();

const ctx = document.getElementById('grafico').getContext('2d');

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [], 
    datasets: [
      {
        label: 'PV',
        data: [],
        borderColor: '#00bcd4',
        tension: 0.2
      },
      {
        label: 'SP',
        data: [],
        borderColor: '#4caf50',
        tension: 0.2
      },
      {
        label: 'MV',
        data: [],
        borderColor: '#ff9800',
        tension: 0.2
      }
    ]
  },
  options: {
    animation: false,
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: 'Tempo Simulador' }
      },
      y: {
        title: { display: true, text: 'Valor' },
        beginAtZero: true
      }
    }
  }
});

function atualizarGrafico({ tempo, pv, sp, mv }) {
  chart.data.labels.push(tempo);
  chart.data.datasets[0].data.push(pv);
  chart.data.datasets[1].data.push(sp);
  chart.data.datasets[2].data.push(mv);

  if (chart.data.labels.length > 100) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(d => d.data.shift());
  }

  chart.update();
}

fetch('/historico')
  .then(res => res.json())
  .then(dados => {
    dados.forEach(d => atualizarGrafico(d));
  });

socket.on('novo-dado', (dado) => {
  atualizarGrafico(dado);
});

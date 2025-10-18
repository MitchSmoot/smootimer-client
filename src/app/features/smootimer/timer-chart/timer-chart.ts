import { EventService } from './../timer/event.service';
import { Component, effect, inject } from '@angular/core';
import * as d3 from 'd3';
import { TimerService } from '../timer/timer.service';
import { Solve } from '../../../core/models/solve';

@Component({
  selector: 'app-timer-chart',
  imports: [],
  templateUrl: './timer-chart.html',
  styleUrl: './timer-chart.scss'
})
export class TimerChart {
  private timerService = inject(TimerService);
  private EventService = inject(EventService);
  solves = this.timerService.solves();


  private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null = null;
  private width = 1080;
  private height = 720;
  private margin = { top: 16, right: 16, bottom: 30, left: 50 };

  constructor() {
    // Effect to react to data changes
    effect(() => {
      const solves = this.timerService.solves();
      const filteredSolves = solves.filter(s => s.event === this.EventService.currentEvent().title);
      this.updateChart(filteredSolves);
    });
  }

  private updateChart(solves: Solve[]): void {
    // Clear existing chart
    d3.select('#chart').selectAll('*').remove();

    // Set up SVG container
    this.svg = d3.select('#chart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const innerWidth = this.width - this.margin.left - this.margin.right;
    const innerHeight = this.height - this.margin.top - this.margin.bottom;

    // Set up scales
    const x = d3.scaleTime()
      .domain(d3.extent(solves, d => d.solveDate) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(solves, d => d.time) as number])
      .range([innerHeight, 0]);

    // Define the line
    const line = d3.line<{ solveDate: Date, time: number }>()
      .x(d => x(d.solveDate))
      .y(d => y(d.time));

    const tooltipDiv = d3.select("#chart").append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // Add the line path
    this.svg.append('path')
      .datum(solves)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add circles for each solve
    this.svg.selectAll("circle")
      .data(solves)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.solveDate))
      .attr("cy", d => y(d.time))
      .attr("r", 5)
      .style("fill", "steelblue").on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 7)
          .style("fill", "orange");

        const tooltip = d3.select("#tooltip");
        tooltip.transition()
          .duration(10)
          .style("opacity", 1);
        tooltip.html(`
          Time: ${d.time / 1000} seconds<br/>
          Date: ${d.solveDate.toLocaleString()}<br/>
          Event: ${d.event}<br/>
          ${d.penalty ? `Penalty: ${d.penalty}<br/>` : ''}
          ${d.comment ? `Comment: ${d.comment}<br/>` : ''}
          ${d.scramble ? `Scramble: ${d.scramble}<br/>` : ''}
        `)
          .style("left", (event.pageX + 16) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 5)
          .style("fill", "steelblue");

        d3.select("#tooltip").transition()
          .duration(100)
          .style("opacity", 0);
      });

    // Add x-axis
    this.svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    // Add y-axis
    this.svg.append('g')
      .call(d3.axisLeft(y));
  }

}

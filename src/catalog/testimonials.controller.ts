import { Controller, Get } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service.js';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  list() {
    return this.testimonialsService.list();
  }
}

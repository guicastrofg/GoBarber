import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore } from 'date-fns'

import Appointment from '../models/Appointments'
import User from '../models/User'

class AppointmentController {
  async store (request, response) {
    // Validando campos de entrada com Yup
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    })

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' })
    }

    const { provider_id, date } = request.body
    // Verificando se o provider_id e de um provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    })

    if (!isProvider) {
      return response.status(401).json({ error: 'You can only appointments with providers' })
    }

    // Verificando se a data de agendamento não é antiga
    const hourStart = startOfHour(parseISO(date))
    if (isBefore(hourStart, new Date())) {
      return response.status(400).json({ error: 'Past dates are not permitted' })
    }

    // Verificando se existe hoário disponível
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    })

    if (checkAvailability) {
      return response.status(401).json({ error: 'Appointment date is not available' })
    }

    const appointment = await Appointment.create({
      user_id: request.userId,
      provider_id,
      date: hourStart
    })

    return response.json(appointment)
  }
}

export default new AppointmentController()

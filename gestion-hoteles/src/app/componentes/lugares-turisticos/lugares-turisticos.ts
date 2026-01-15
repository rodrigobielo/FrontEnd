import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lugares-turisticos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lugares-turisticos.html'
  // Eliminado styleUrls para usar solo Bootstrap
})
export class LugaresTuristicos {
  
  // Array de lugares turísticos de Guinea Ecuatorial
  lugares = [
    {
      id: 1,
      imagen: 'Turismo/Basílica.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Basílica de Guinea Ecuatorial',
      descripcion: 'Basílica Nuestra señora de Inmaculada situada en la ciudad de Mongomo'
    },
    {
      id: 2,
      imagen: 'Turismo/Arena blanca.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Playa de Arena blanca',
      descripcion: 'Playa de Arena Blanca situada en la Isla de Bioko.'
    },
    {
      id: 3,
      imagen: 'Turismo/Cascada de Ureka.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Cascada de Ureka.',
      descripcion: 'Cascada atractiva situada en el pueblo de Ureka, una hermosura digna de ser visitada.'
    },
    {
      id: 4,
      imagen: 'Turismo/Catedral de Malabo.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Catedral de Malabo',
      descripcion: 'Icono arquitectónico de la capital, construida durante la época colonial española con un estilo gótico-neoclásico impresionante.'
    },
    {
      id: 5,
      imagen: 'Turismo/Islote de Sipop.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Islote de Sipopo',
      descripcion: 'Una hermosura situada al lado de la isla de Bioko'
    },
    {
      id: 6,
      imagen: 'Turismo/Lago Biaó de Moka.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Lago Biaó',
      descripcion: 'Situado a unos kilómetros del municipio de Moka, destaca por su belleza y atractivo.'
    },
    {
      id: 7,
      imagen: 'Turismo/Palacio del pueblo de Malabo.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Palacio presidencial',
      descripcion: 'Impresiona su arquitectura colonial, una preciosidad digna de ser visitada.'
    },
    {
      id: 8,
      imagen: 'Turismo/Playa de Annobón.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Playa de Annobón',
      descripcion: 'Situada en la isla más lejana de Guinea Ecuatorial, pero un praiso digno de ser visitado.'
    },

    {
      id: 9,
      imagen: 'Turismo/Paseo Marítimo de Malabo.png',
      pais: 'Guinea Ecuatorial',
      nombre: 'Paseo marítimo de Malabo',
      descripcion: 'Un lugar de hocio, para pasar una tarde con familiares, amigos y conocidos'
    }
  ];

  // Método para manejar el botón "Visitar"
  visitarLugar(lugar: any): void {
    console.log('Redirigiendo a:', lugar);
    alert(`Redirigiendo a información de viaje a ${lugar.nombre}`);
  }

  // Método para manejar el botón "Más información"
  mostrarInformacion(lugar: any): void {
    console.log('Mostrando información detallada:', lugar);
    const infoCompleta = `
      INFORMACIÓN DEL LUGAR
      =====================
      Nombre: ${lugar.nombre}
      Ubicación: ${lugar.pais}
      
      Descripción:
      ${lugar.descripcion}
    `;
    alert(infoCompleta);
  }

  // Métodos para el carrusel (navegación)
  scrollLeft() {
    const container = document.querySelector('.cards-container');
    if (container) {
      container.scrollBy({ left: -350, behavior: 'smooth' });
    }
  }

  scrollRight() {
    const container = document.querySelector('.cards-container');
    if (container) {
      container.scrollBy({ left: 350, behavior: 'smooth' });
    }
  }
}
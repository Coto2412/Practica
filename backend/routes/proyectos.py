from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models.proyecto import Proyecto
from app import db

proyectos_bp = Blueprint('proyectos', __name__)

@proyectos_bp.route('/proyectos', methods=['GET'])
def obtener_proyectos():
    try:
        proyectos = Proyecto.query.filter(Proyecto.nota.is_(None)).all()
        
        resultado = []
        for proyecto in proyectos:
            proyecto_info = {
                'id': proyecto.id,
                'estudiante': f"{proyecto.estudiante.nombre} {proyecto.estudiante.apellido}",
                'correo': proyecto.estudiante.email,
                'proyecto_titulo': proyecto.titulo,
                'profesor_guia': f"{proyecto.profesor_guia.nombre} {proyecto.profesor_guia.apellido}",
                'profesor_informante': f"{proyecto.profesor_informante.nombre} {proyecto.profesor_informante.apellido}"
            }
            resultado.append(proyecto_info)
            
        return jsonify({
            'data': resultado,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@proyectos_bp.route('/proyectos/<int:id>', methods=['GET'])
def obtener_proyecto(id):
    try:
        proyecto = Proyecto.query.get_or_404(id)
        return jsonify({
            'proyecto': {
                'id': proyecto.id,
                'titulo': proyecto.titulo,
                'descripcion': proyecto.descripcion,
                'estudiante_id': proyecto.estudiante_id,
                'profesor_guia_id': proyecto.profesor_guia_id,
                'profesor_informante_id': proyecto.profesor_informante_id
            },
            'status': 'success'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@proyectos_bp.route('/proyectos', methods=['POST'])
@jwt_required()
def crear_proyecto():
    try:
        data = request.get_json()
        
        nuevo_proyecto = Proyecto(
            titulo=data['titulo'],
            descripcion=data['descripcion'],
            estudiante_id=data['estudiante_id'],
            profesor_guia_id=data['profesor_guia_id'],
            profesor_informante_id=data['profesor_informante_id']
        )
        
        db.session.add(nuevo_proyecto)
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto creado exitosamente',
            'status': 'success'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@proyectos_bp.route('/proyectos/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_proyecto(id):
    try:
        proyecto = Proyecto.query.get_or_404(id)
        data = request.get_json()
        
        proyecto.titulo = data['titulo']
        proyecto.descripcion = data['descripcion']
        proyecto.estudiante_id = data['estudiante_id']
        proyecto.profesor_guia_id = data['profesor_guia_id']
        proyecto.profesor_informante_id = data['profesor_informante_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto actualizado exitosamente',
            'status': 'success'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@proyectos_bp.route('/proyectos/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_proyecto(id):
    try:
        proyecto = Proyecto.query.get_or_404(id)
        
        db.session.delete(proyecto)
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto eliminado exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@proyectos_bp.route('/proyectos/<int:id>/finalizar', methods=['PUT'])
@jwt_required()
def finalizar_proyecto(id):
    try:
        proyecto = Proyecto.query.get_or_404(id)
        data = request.get_json()
        
        if 'nota' not in data:
            return jsonify({
                'error': 'La nota es requerida',
                'status': 'error'
            }), 400
            
        proyecto.nota = float(data['nota'])
        proyecto.estado = 'Aprobado' if proyecto.nota >= 4.0 else 'Reprobado'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto finalizado exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@proyectos_bp.route('/proyectos/finalizados', methods=['GET'])
def obtener_proyectos_finalizados():
    try:
        proyectos = Proyecto.query.filter(Proyecto.nota.isnot(None)).all()
        
        resultado = []
        for proyecto in proyectos:
            proyecto_info = {
                'id': proyecto.id,
                'estudiante': f"{proyecto.estudiante.nombre} {proyecto.estudiante.apellido}",
                'correo': proyecto.estudiante.email,
                'proyecto_titulo': proyecto.titulo,
                'profesor_guia': f"{proyecto.profesor_guia.nombre} {proyecto.profesor_guia.apellido}",
                'profesor_informante': f"{proyecto.profesor_informante.nombre} {proyecto.profesor_informante.apellido}",
                'nota': proyecto.nota,
                'estado': proyecto.estado
            }
            resultado.append(proyecto_info)
            
        return jsonify({
            'data': resultado,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500